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
        .badge { position: fixed; right: 16px; top: 72px; z-index: 2147483647; display: flex; align-items: center; gap: 8px;
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
// 2026-11-17 실제 화면에서 확인한 규칙. 사이트 구조가 바뀌면 여기를 고친다.
// 언어에 따라 바뀌는 aria-label(예: "중지", "Stop")에는 기대지 않는다.
// 질문 한 개당 정확히 한 요소만 걸리도록 넓은 패턴(class*="user" 등)은 쓰지 않는다.
const SELECTORS: Record<PlatformType, {
  userMessage: string
  assistantMessage: string
  streamingIndicator: string
}> = {
  'chat.openai.com': {
    userMessage: '[data-user-message-bubble="true"], [data-message-author-role="user"]',
    assistantMessage: '[data-dil-response], [data-message-author-role="assistant"]',
    streamingIndicator: '[data-talvt-turn-state="in_progress"], button[data-testid="stop-button"]'
  },
  'claude.ai': {
    userMessage: '[data-testid="user-message"]',
    assistantMessage: '[data-testid="assistant-message"]',
    streamingIndicator: '[data-is-streaming="true"], [data-testid="chat-input-stop"]'
  },
  'gemini.google.com': {
    userMessage: 'user-query',
    assistantMessage: 'model-response',
    streamingIndicator: '.send-button mat-icon[fonticon="stop"], .send-button mat-icon[data-mat-icon-name="stop"]'
  },
}

const INIT_DELAY: Record<PlatformType, number> = {
  'chat.openai.com': 3000,
  'claude.ai': 2000,
  'gemini.google.com': 2000,
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

/**
 * 말풍선마다 바뀌지 않는 식별값.
 *
 * 말풍선 "개수"로 전송을 감지하면 안 된다:
 *  - ChatGPT는 긴 대화에서 화면 밖 말풍선을 지웠다가 스크롤하면 다시 그린다(하나 추가 + 하나 삭제 = 개수 그대로).
 *  - 다른 대화로 이동하면 개수가 늘어 질문을 안 보냈는데도 질문으로 센다.
 * 그래서 말풍선마다 식별값을 기억하고, "맨 끝에 처음 보는 말풍선"이 생겼을 때만 질문으로 센다.
 *
 * 식별값은 사이트가 말풍선마다 붙여 둔 속성을 쓰되, 실제로 말풍선마다 값이 다를 때만 쓴다.
 * 없으면 텍스트 + 같은 텍스트 중 몇 번째인지로 대신한다.
 */
const STABLE_KEY_ATTRS = ['data-content-search-unit-key', 'data-message-id']

function messageKeys(bubbles: Element[]): (string | null)[] {
  const attrValues = (attr: string) => bubbles.map((el) => el.closest(`[${attr}]`)?.getAttribute(attr) ?? null)
  for (const attr of STABLE_KEY_ATTRS) {
    const values = attrValues(attr)
    const unique = values.every((v) => v !== null) && new Set(values).size === values.length
    if (bubbles.length > 0 && unique) return values.map((v) => `${attr}:${v}`)
  }
  const textCount = new Map<string, number>()
  return bubbles.map((el) => {
    const text = el.textContent?.trim() ?? ''
    if (!text) return null // 아직 내용이 채워지지 않음: 다음 변경 때 다시 본다
    const n = (textCount.get(text) ?? 0) + 1
    textCount.set(text, n)
    return `text:${n}:${text.slice(0, 300)}`
  })
}

// 사용자 메시지 전송 감지
function setupMessageDetection() {
  if (!selectors) return

  const seen = new Set<string>()
  let lastPath = location.pathname
  /** 이 시각 전까지는 새로 보이는 말풍선을 "이미 있던 대화"로 보고 세지 않는다 */
  let baselineUntil = Date.now() + 1500
  /** 사용자가 Enter나 전송 버튼을 누른 시각 */
  let sendIntentAt = 0
  const SEND_WINDOW_MS = 4000
  /** 마지막으로 질문으로 센 말풍선 */
  let lastCounted: { el: Element; text: string; at: number } | null = null

  const scan = () => {
    const now = Date.now()
    const sentRecently = now - sendIntentAt < SEND_WINDOW_MS
    if (location.pathname !== lastPath) {
      lastPath = location.pathname
      // 질문을 보내서 주소가 바뀐 게 아니라면(다른 대화로 이동) 그 대화의 기존 말풍선은 세지 않는다
      if (!sentRecently) baselineUntil = now + 2500
    }

    const bubbles = Array.from(document.querySelectorAll(selectors.userMessage))
    const keys = messageKeys(bubbles)
    let foundNew = false
    let newestIsNew = false
    keys.forEach((key, index) => {
      if (!key || seen.has(key)) return
      seen.add(key)
      foundNew = true
      if (index === bubbles.length - 1) newestIsNew = true
    })

    const inBaseline = now < baselineUntil && !sentRecently
    if (inBaseline) {
      // 대화 내용이 아직 불러와지는 중이면 기다리는 시간을 늘린다
      if (foundNew) baselineUntil = Math.max(baselineUntil, now + 1500)
      return
    }
    if (!newestIsNew) return

    // ChatGPT는 보낸 질문을 임시 말풍선으로 먼저 그렸다가, 서버가 받으면 식별값이 바뀐 말풍선으로 교체한다.
    // 방금 센 말풍선이 교체된 것이면(같은 내용이 10초 안에 다시 나타남) 새 질문으로 세지 않는다.
    const newest = bubbles[bubbles.length - 1]
    const text = newest.textContent?.trim() ?? ''
    const prev = lastCounted
    const replaced = !!prev && now - prev.at < 10_000 &&
      (prev.el === newest || !prev.el.isConnected) &&
      (prev.text === text || !prev.text || !text)
    lastCounted = { el: newest, text, at: now }
    if (!replaced) triggerUserMessage()
  }

  // 변경이 몰려도(답변 스트리밍 등) 0.2초에 한 번만 검사
  let scheduled = false
  const scheduleScan = () => {
    if (scheduled) return
    scheduled = true
    setTimeout(() => {
      scheduled = false
      scan()
    }, 200)
  }

  scan() // 처음 화면에 이미 있는 말풍선을 기억 (세지 않음)
  new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true, characterData: true })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.isComposing) {
      const active = document.activeElement
      if (active?.tagName === 'TEXTAREA' ||
          (active as HTMLElement)?.getAttribute?.('contenteditable') === 'true' ||
          active?.closest('[contenteditable="true"]') ||
          active?.closest('rich-textarea') || // Gemini uses rich-textarea
          active?.closest('[role="textbox"]')) {
        captureDraft(active)
        sendIntentAt = Date.now()
        setTimeout(scan, 1000)
      }
    }
  }, true)

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('button[aria-label*="Send"], button[aria-label*="submit"], button[data-testid*="send"], [class*="send-button"], [class*="submit"], [data-testid="chat-input-send"]')) {
      captureDraft(findComposer())
      sendIntentAt = Date.now()
      setTimeout(scan, 1000)
    }
  }, true)
}

// AI 응답 감지: 사이트의 "생성 중" 표시만 본다.
// (답변 말풍선 개수는 대화 이동·스크롤에도 바뀌어 잘못 감지되므로 쓰지 않는다)
function setupResponseDetection() {
  if (!selectors) return

  const check = () => {
    const streaming = !!document.querySelector(selectors.streamingIndicator)
    const now = Date.now()

    if (!isAiResponding && streaming) {
      if (now - lastAiResponseStartTime < AI_EVENT_DEBOUNCE) return
      isAiResponding = true
      lastAiResponseStartTime = now
      sendEvent({ type: 'AI_RESPONSE_START', message: 'AI started responding' })
      return
    }

    if (isAiResponding && !streaming) {
      // 표시가 잠깐 사라졌다 다시 생기는 경우를 거르기 위해 1초 뒤 한 번 더 확인
      setTimeout(() => {
        if (!isAiResponding || document.querySelector(selectors.streamingIndicator)) return
        const end = Date.now()
        if (end - lastAiResponseEndTime < AI_EVENT_DEBOUNCE) return
        isAiResponding = false
        lastAiResponseEndTime = end
        sendEvent({ type: 'AI_RESPONSE_END', message: 'AI finished responding', detail: responseDetail() })
      }, 1000)
    }
  }

  let scheduled = false
  new MutationObserver(() => {
    if (scheduled) return
    scheduled = true
    setTimeout(() => {
      scheduled = false
      check()
    }, 200)
  }).observe(document.body, { childList: true, subtree: true, attributes: true })
  setInterval(check, 2000)
}

if (platform) {
  const delay = INIT_DELAY[platform]
  setTimeout(() => {
    setupMessageDetection()
    setupResponseDetection()
    console.log(`[HANDOFF] Monitoring ${platform}`)
  }, delay)
}
