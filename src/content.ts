import type { AgentEvent, PlatformType } from './types/agent'

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
  }
})

loadMonitoringState()

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
  sendEvent({ type: 'PROMPT_SUBMIT', message: `User sent message #${userMessageCount}` })
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
          sendEvent({ type: 'AI_RESPONSE_END', message: 'AI finished responding' })
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
      sendEvent({ type: 'AI_RESPONSE_END', message: 'AI finished responding' })
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
