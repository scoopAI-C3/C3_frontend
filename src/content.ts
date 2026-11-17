import type { AgentEvent, EventDetail, PlatformType } from './types/agent'
import { classifyIntent } from './local/intent'
import {
  DETAIL_MODE_KEY,
  conversationPath,
  isExpired,
  isHomePath,
  remainingText,
  type DetailMode,
} from './local/detailMode'

function detectPlatform(): PlatformType | null {
  const host = window.location.hostname
  if (host.includes('chatgpt.com')) return 'chat.openai.com'
  if (host.includes('claude.ai')) return 'claude.ai'
  if (host.includes('gemini.google.com')) return 'gemini.google.com'
  if (host.includes('copilot.microsoft.com')) return 'copilot.microsoft.com'
  return null
}

const platform = detectPlatform()
if (!platform) {
  console.log('Unknown platform')
}

// 모니터링 상태
let isMonitoringEnabled = true

async function loadMonitoringState() {
  try {
    const data = await chrome.storage.local.get('isMonitoring') as { isMonitoring?: boolean }
    isMonitoringEnabled = data.isMonitoring !== false;
    console.log('[HANDOFF] Monitoring enabled:', isMonitoringEnabled);
  } catch (err) {
    console.error('[HANDOFF] Failed to load monitoring state:', err);
  }
}

// storage 변경 감지
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isMonitoring?.newValue !== undefined) {
    isMonitoringEnabled = changes.isMonitoring.newValue as boolean
    console.log('[HANDOFF] Monitoring changed:', isMonitoringEnabled);
    renderBadge()
  }
})

loadMonitoringState()

// ── 상세 분석 (사용자가 동의했을 때만) ─────────────────────────
// 질문 텍스트는 이 파일 안에서 요청 유형으로 분류하는 데에만 쓰이고, 저장하거나 보내지 않는다.

let detailMode: DetailMode | null = null
/** 새 대화 화면에서 "이 대화만"으로 켠 탭인지 (팝업이 이 탭에만 알려 준다) */
let pendingBind = false

async function loadDetailMode() {
  try {
    const data = (await chrome.storage.local.get(DETAIL_MODE_KEY)) as { [DETAIL_MODE_KEY]?: DetailMode }
    detailMode = data[DETAIL_MODE_KEY] ?? null
  } catch {
    detailMode = null
  }
  renderBadge()
}

/** 지금 이 페이지에서 상세 분석이 켜져 있는지 */
function isDetailActiveHere(): boolean {
  const mode = detailMode
  if (!mode || isExpired(mode)) return false
  if (mode.scope !== 'conversation') return true
  const target = mode.conversation
  if (!target || target.host !== location.host) return false
  const current = conversationPath(location.pathname)
  if (target.path !== null) return target.path === current
  if (!pendingBind) return false
  // 새 대화 화면에서 켠 경우: 첫 질문 뒤 대화 주소가 생기면 그 주소로 묶는다
  if (!isHomePath(current)) {
    const bound: DetailMode = { ...mode, conversation: { host: target.host, path: current } }
    detailMode = bound
    chrome.storage.local.set({ [DETAIL_MODE_KEY]: bound }).catch(() => undefined)
  }
  return true
}

/** 전송 직전 입력창의 텍스트 (전송되면 입력창이 비므로 미리 잡아 둔다) */
let lastDraft: { text: string; at: number } | null = null

function readInputText(element: Element | null): string {
  if (!element) return ''
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) return element.value
  const editable = element.closest('[contenteditable="true"]') ?? element
  return (editable as HTMLElement).innerText ?? ''
}

function captureDraft(element: Element | null) {
  if (!isDetailActiveHere()) return
  const text = readInputText(element).trim()
  if (text) lastDraft = { text, at: Date.now() }
}

function findComposer(): Element | null {
  const candidates = document.querySelectorAll('textarea, [contenteditable="true"], rich-textarea [contenteditable]')
  for (const candidate of Array.from(candidates).reverse()) {
    if (readInputText(candidate).trim()) return candidate
  }
  return null
}

function lastText(selector: string | undefined): string {
  if (!selector) return ''
  const nodes = document.querySelectorAll(selector)
  const last = nodes[nodes.length - 1] as HTMLElement | undefined
  return last?.innerText?.trim() ?? ''
}

function promptDetail(): EventDetail | undefined {
  if (!isDetailActiveHere()) return undefined
  const fresh = lastDraft && Date.now() - lastDraft.at < 5000 ? lastDraft.text : ''
  const text = fresh || lastText(selectors?.userMessage)
  lastDraft = null
  if (!text) return undefined
  return { intent: classifyIntent(text), length: text.length }
}

function responseDetail(): EventDetail | undefined {
  if (!isDetailActiveHere()) return undefined
  const text = lastText(selectors?.assistantMessage)
  return text ? { responseLength: text.length } : undefined
}

// 화면 구석 표시: 상세 분석이 켜져 있으면 항상 보이게 해서 사용자가 잊지 않게 한다
const badgeLang: 'ko' | 'en' = navigator.language?.toLowerCase().startsWith('ko') ? 'ko' : 'en'
let badgeHost: HTMLElement | null = null

function renderBadge() {
  if (!platform) return
  const active = isMonitoringEnabled && isDetailActiveHere()
  if (!active) {
    badgeHost?.remove()
    badgeHost = null
    return
  }
  if (!badgeHost) {
    badgeHost = document.createElement('div')
    badgeHost.id = 'handoff-detail-badge'
    const root = badgeHost.attachShadow({ mode: 'open' })
    root.innerHTML = `
      <style>
        .badge { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; display: flex; align-items: center; gap: 8px;
          padding: 8px 10px 8px 12px; border-radius: 999px; background: #211F26; color: #fff; border: 1px solid #A36EFF;
          font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", sans-serif; box-shadow: 0 6px 20px rgba(0,0,0,.35); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #FF7DFD; box-shadow: 0 0 8px #FF7DFD; }
        .time { color: rgba(255,255,255,.6); font-weight: 500; }
        button { all: unset; cursor: pointer; padding: 3px 8px; border-radius: 999px; background: rgba(255,255,255,.12); }
        button:hover { background: rgba(255,255,255,.22); }
      </style>
      <div class="badge" role="status">
        <span class="dot"></span>
        <span>${badgeLang === 'ko' ? 'HANDOFF 상세 분석 중' : 'HANDOFF detailed analysis on'}</span>
        <span class="time"></span>
        <button type="button">${badgeLang === 'ko' ? '끄기' : 'Turn off'}</button>
      </div>`
    root.querySelector('button')?.addEventListener('click', () => {
      chrome.storage.local.remove(DETAIL_MODE_KEY).catch(() => undefined)
    })
    document.documentElement.appendChild(badgeHost)
  }
  const time = badgeHost.shadowRoot?.querySelector('.time')
  if (time && detailMode) time.textContent = '· ' + remainingText(detailMode, badgeLang)
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && DETAIL_MODE_KEY in changes) {
    detailMode = (changes[DETAIL_MODE_KEY].newValue as DetailMode | undefined) ?? null
    if (!detailMode) pendingBind = false
    renderBadge()
  }
})

// 팝업이 "이 대화만" 범위를 정할 때 이 페이지 정보를 묻는다
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!platform) return
  if (message?.type === 'HANDOFF_GET_PAGE') {
    const path = conversationPath(location.pathname)
    sendResponse({ host: location.host, path, isHome: isHomePath(path) })
  } else if (message?.type === 'HANDOFF_BIND_PENDING') {
    pendingBind = true
    sendResponse({ ok: true })
  }
})

loadDetailMode()
// SPA 주소 변경, 남은 시간, 만료를 반영
setInterval(renderBadge, 15_000)
let lastPath = location.pathname
setInterval(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname
    renderBadge()
  }
}, 1000)

function sendEvent(event: Omit<AgentEvent, 'timestamp' | 'platform'>) {
  if (!platform) return
  if (!isMonitoringEnabled) {
    console.log('[HANDOFF] Monitoring disabled, skipping:', event.message)
    return
  }

  const fullEvent: AgentEvent = {
    ...event,
    timestamp: Date.now(),
    platform
  }

  try {
    // 확장 프로그램이 업데이트/재시작되면 이전 페이지의 content script는 연결이 끊긴다. 조용히 무시.
    chrome.runtime.sendMessage({ type: 'AGENT_EVENT', payload: fullEvent }).catch(() => undefined)
  } catch {
    return
  }
  console.log('[HANDOFF]', fullEvent.message)
}

// 세션 시작
sendEvent({ type: 'SESSION_START', message: 'Session started' })

// 페이지 이탈 시 세션 종료
window.addEventListener('beforeunload', () => {
  sendEvent({ type: 'SESSION_END', message: 'Session ended' })
})

// AI 응답 상태 추적
let isAiResponding = false
let lastAiResponseStartTime = 0
let lastAiResponseEndTime = 0
const AI_EVENT_DEBOUNCE = 2000

// 플랫폼별 셀렉터 정의
const SELECTORS: Record<PlatformType, {
  userMessage: string
  assistantMessage: string
  streamingIndicator: string
}> = {
  'chat.openai.com': {
    userMessage: '[data-message-author-role="user"]',
    assistantMessage: '[data-message-author-role="assistant"]',
    streamingIndicator: 'button[aria-label="Stop generating"], button[data-testid="stop-button"], .result-streaming, [data-is-streaming="true"]'
  },
  'claude.ai': {
    userMessage: '[data-testid*="human"], [data-testid*="user"], .human-turn, .user-message, div[class*="human"], div[class*="user-turn"], [data-is-user-message="true"]',
    assistantMessage: '[data-testid*="assistant"], [data-testid*="claude"], .assistant-turn, .claude-message, div[class*="assistant"], div[class*="claude-turn"], [data-is-assistant-message="true"], [data-testid="message-content"]',
    streamingIndicator: '[data-is-streaming="true"]'
  },
  'gemini.google.com': {
    userMessage: '[data-turn-role="user"], .user-query, user-query, [class*="query-content"], [class*="user-message"], [class*="human-turn"], message-content[data-message-author-role="user"]',
    assistantMessage: '[data-turn-role="model"], .model-response, model-response, [class*="response-content"], [class*="model-message"], [class*="assistant-turn"], message-content[data-message-author-role="model"]',
    streamingIndicator: '[data-loading="true"], .loading-indicator, .thinking-indicator, [aria-busy="true"], .streaming, [class*="loading"], [class*="thinking"], .response-streaming, loading-indicator'
  },
  'copilot.microsoft.com': {
    userMessage: '[data-content="user-message"], .user-message, [class*="UserMessage"], cib-message-group[source="user"]',
    assistantMessage: '[data-content="ai-message"], .ai-message, [class*="BotMessage"], cib-message-group[source="bot"]',
    streamingIndicator: '[data-is-streaming="true"], .typing-indicator, [class*="typing"], cib-typing-indicator, [aria-busy="true"]'
  }
}

const INIT_DELAY: Record<PlatformType, number> = {
  'chat.openai.com': 3000,
  'claude.ai': 2000,
  'gemini.google.com': 2000,
  'copilot.microsoft.com': 3000
}

const selectors = platform ? SELECTORS[platform] : null

let lastUserMessageTime = 0
let userMessageCount = 0

// 메시지 전송 이벤트 발생
function triggerUserMessage() {
  const now = Date.now()
  if (now - lastUserMessageTime < 1000) return
  lastUserMessageTime = now
  userMessageCount++
  sendEvent({ type: 'PROMPT_SUBMIT', message: `User sent message #${userMessageCount}`, detail: promptDetail() })
}

// 사용자 메시지 전송 감지
function setupMessageDetection() {
  if (!selectors) return

  const debugUserSelectors = () => {
    const selectorList = selectors.userMessage.split(', ')
    selectorList.forEach(sel => {
      try {
        const matches = document.querySelectorAll(sel)
        if (matches.length > 0) {
          console.log(`[HANDOFF] User selector matched: "${sel}" (${matches.length} elements)`)
        }
      } catch {
        // invalid selector
      }
    })
  }
  debugUserSelectors()

  let lastUserMessageCount = document.querySelectorAll(selectors.userMessage).length
  console.log(`[HANDOFF] Initial user message count: ${lastUserMessageCount}`)

  const userMessageObserver = new MutationObserver(() => {
    const currentCount = document.querySelectorAll(selectors.userMessage).length
    if (currentCount > lastUserMessageCount) {
      console.log(`[HANDOFF] User message count changed: ${lastUserMessageCount} -> ${currentCount}`)
      triggerUserMessage()
      lastUserMessageCount = currentCount
    }
  })

  userMessageObserver.observe(document.body, {
    childList: true,
    subtree: true
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      const active = document.activeElement
      if (active?.tagName === 'TEXTAREA' ||
          (active as HTMLElement)?.getAttribute?.('contenteditable') === 'true' ||
          active?.closest('[contenteditable="true"]') ||
          active?.closest('rich-textarea') || // Gemini uses rich-textarea
          active?.closest('[role="textbox"]')) {
        console.log('[HANDOFF] Enter key detected in input area')
        captureDraft(active)
        setTimeout(() => {
          const newCount = document.querySelectorAll(selectors.userMessage).length
          if (newCount > lastUserMessageCount) {
            triggerUserMessage()
            lastUserMessageCount = newCount
          } else {
            if (platform === 'gemini.google.com') {
              console.log('[HANDOFF] Gemini: Enter detected, treating as message submit')
              triggerUserMessage()
            }
          }
        }, 1000)
      }
    }
  })

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('button[aria-label*="Send"], button[aria-label*="submit"], button[data-testid*="send"], [class*="send-button"], [class*="submit"]')) {
      console.log('[HANDOFF] Send button clicked')
      captureDraft(findComposer())
      setTimeout(() => {
        const newCount = document.querySelectorAll(selectors.userMessage).length
        if (newCount > lastUserMessageCount) {
          triggerUserMessage()
          lastUserMessageCount = newCount
        } else if (platform === 'gemini.google.com') {
          console.log('[HANDOFF] Gemini: Send button clicked, treating as message submit')
          triggerUserMessage()
        }
      }, 1000)
    }
  })
}

// AI 응답 감지
function setupResponseDetection() {
  if (!selectors) return

  let lastAssistantCount = document.querySelectorAll(selectors.assistantMessage).length
  console.log(`[HANDOFF] Initial assistant message count: ${lastAssistantCount}`)

  const debugSelectors = () => {
    const selectorList = selectors.streamingIndicator.split(', ')
    selectorList.forEach(sel => {
      const match = document.querySelector(sel)
      if (match) {
        console.log(`[HANDOFF] Matched streaming selector: ${sel}`, match)
      }
    })
  }

  const observer = new MutationObserver(() => {
    const streamingElement = document.querySelector(selectors.streamingIndicator)
    const currentAssistantCount = document.querySelectorAll(selectors.assistantMessage).length

    // AI 응답 시작 감지
    const now = Date.now()
    if (!isAiResponding && (streamingElement || currentAssistantCount > lastAssistantCount)) {
      if (now - lastAiResponseStartTime < AI_EVENT_DEBOUNCE) {
        return
      }
      isAiResponding = true
      lastAiResponseStartTime = now
      lastAssistantCount = currentAssistantCount
      console.log(`[HANDOFF] Streaming detected:`, streamingElement ? 'by indicator' : 'by message count')
      debugSelectors()
      sendEvent({ type: 'AI_RESPONSE_START', message: 'AI started responding' })
    }

    // AI 응답 종료 감지
    if (isAiResponding && !streamingElement) {
      setTimeout(() => {
        const stillStreaming = document.querySelector(selectors.streamingIndicator)
        const checkTime = Date.now()
        if (!stillStreaming && isAiResponding) {
          if (checkTime - lastAiResponseEndTime < AI_EVENT_DEBOUNCE) {
            return
          }
          isAiResponding = false
          lastAiResponseEndTime = checkTime
          lastAssistantCount = document.querySelectorAll(selectors.assistantMessage).length
          sendEvent({ type: 'AI_RESPONSE_END', message: 'AI finished responding', detail: responseDetail() })
        }
      }, 1000)
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  })

  setInterval(() => {
    const streamingElement = document.querySelector(selectors.streamingIndicator)
    const now = Date.now()

    if (!isAiResponding && streamingElement) {
      // 중복 방지
      if (now - lastAiResponseStartTime < AI_EVENT_DEBOUNCE) {
        return
      }
      isAiResponding = true
      lastAiResponseStartTime = now
      console.log('[HANDOFF] Polling detected streaming start')
      debugSelectors()
      sendEvent({ type: 'AI_RESPONSE_START', message: 'AI started responding' })
    }

    if (isAiResponding && !streamingElement) {
      // 중복 방지
      if (now - lastAiResponseEndTime < AI_EVENT_DEBOUNCE) {
        return
      }
      isAiResponding = false
      lastAiResponseEndTime = now
      console.log('[HANDOFF] Polling detected streaming end')
      sendEvent({ type: 'AI_RESPONSE_END', message: 'AI finished responding', detail: responseDetail() })
    }
  }, 2000)
}

if (platform) {
  const delay = INIT_DELAY[platform]
  setTimeout(() => {
    setupMessageDetection()
    setupResponseDetection()
    console.log(`[HANDOFF] Monitoring ${platform}`)
  }, delay)
}
