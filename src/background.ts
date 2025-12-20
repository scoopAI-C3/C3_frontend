import type { AgentEvent } from './types/agent'
import { startSession } from './apis/session'

// 최대 저장 이벤트 수
const MAX_EVENTS = 50

// 현재 세션 ID
let currentSessionId: string | null = null

// 이벤트 저장
async function saveEvent(event: AgentEvent) {
  const result = await chrome.storage.local.get('events') as { events?: AgentEvent[] }
  const events = result.events ?? []

  // 새 이벤트 추가 (최신이 앞으로)
  const updatedEvents = [event, ...events].slice(0, MAX_EVENTS)

  await chrome.storage.local.set({ events: updatedEvents })

  // 현재 상태 업데이트
  await updateStatus(event)

  if (event.type === 'session_start') {
    try {
      const response = await startSession()
      if (response.isSuccess && response.result) {
        currentSessionId = response.result.sessionId
        await chrome.storage.local.set({ sessionId: currentSessionId })
        console.log('[HANDOFF] Session started with ID:', currentSessionId)
      }
    } catch (err) {
      console.error('[HANDOFF] Failed to start session:', err)
    }
  }

  // 세션 종료 시 초기화
  if (event.type === 'session_end') {
    currentSessionId = null
    await chrome.storage.local.remove('sessionId')
  }
}

// 상태 업데이트
async function updateStatus(event: AgentEvent) {
  const statusMap: Record<AgentEvent['type'], string> = {
    'session_start': 'Observing',
    'session_end': 'Inactive',
    'user_message': 'Observing',
    'ai_response_start': 'Approaching Decision Boundary',
    'ai_response_end': 'Observing'
  }

  const riskMap: Record<AgentEvent['type'], string> = {
    'session_start': 'Low',
    'session_end': 'Low',
    'user_message': 'Medium',
    'ai_response_start': 'High',
    'ai_response_end': 'Low'
  }

  await chrome.storage.local.set({
    agentStatus: statusMap[event.type],
    decisionRisk: riskMap[event.type],
    lastActivity: event.timestamp,
    activePlatform: event.platform
  })
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AGENT_EVENT') {
    saveEvent(message.payload)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }

  if (message.type === 'GET_EVENTS') {
    chrome.storage.local.get(['events', 'agentStatus', 'decisionRisk', 'activePlatform'])
      .then((data) => sendResponse(data))
      .catch((err) => sendResponse({ error: err.message }))
    return true
  }

  if (message.type === 'CLEAR_EVENTS') {
    chrome.storage.local.set({ events: [] })
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }
})

// 확장프로그램 설치 시 초기화
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    events: [],
    agentStatus: 'Inactive',
    decisionRisk: 'Low',
    activePlatform: null
  })
  console.log('[HANDOFF] Extension installed')
})

console.log('[HANDOFF] Background script loaded')
