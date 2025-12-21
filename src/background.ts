import type { AgentEvent, EventType } from './types/agent'
import type { InteractionTimelineItem, SessionObserveRequest } from './types/session'
import { startSession, observeSession } from './apis/session'

// 최대 저장 이벤트 수
const MAX_EVENTS = 50

// observe API 호출 조건 설정
const OBSERVE_CONDITIONS = {
  promptThreshold: 5,        // N회 프롬프트 누적 시 호출
  idleTimeoutSec: 60,        // 마지막 전송 후 X초 경과 시 호출
  refinementIntervalSec: 30  // refinement loop 판단 기준 (초)
}

// 현재 세션 ID
let currentSessionId: string | null = null

// 세션 추적 데이터
let sessionStartTime: string | null = null
const activePlatforms: Set<string> = new Set() // 여러 플랫폼 추적
let userMessageTimestamps: number[] = []
let interactionTimeline: InteractionTimelineItem[] = []

// observe API 호출 추적
let promptsSinceLastObserve: number = 0
let idleCheckTimer: ReturnType<typeof setTimeout> | null = null

// observe 요청 데이터 생성
function buildObserveRequest(endTime: number): SessionObserveRequest | null {
  if (!currentSessionId || !sessionStartTime || activePlatforms.size === 0) {
    return null
  }

  // 평균 프롬프트 간격 계산
  let avgPromptIntervalSec = 0
  if (userMessageTimestamps.length > 1) {
    const intervals: number[] = []
    for (let i = 1; i < userMessageTimestamps.length; i++) {
      intervals.push((userMessageTimestamps[i] - userMessageTimestamps[i - 1]) / 1000)
    }
    avgPromptIntervalSec = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
  }

  // refinement loop 감지
  const refinementLoopDetected = userMessageTimestamps.some((ts, i) => {
    if (i === 0) return false
    return (ts - userMessageTimestamps[i - 1]) < OBSERVE_CONDITIONS.refinementIntervalSec * 1000
  })

  // 사용된 모든 플랫폼을 쉼표로 연결
  const platformsUsed = Array.from(activePlatforms).join(',')

  return {
    sessionId: currentSessionId,
    context: {
      domain: platformsUsed,
      sessionStartAt: sessionStartTime,
      sessionEndAt: new Date(endTime).toISOString()
    },
    interactionMetrics: {
      promptSubmitCount: userMessageTimestamps.length,
      avgPromptIntervalSec,
      refinementLoopDetected
    },
    interactionTimeline
  }
}

// observe API 호출
async function callObserveAPI(reason: string) {
  const request = buildObserveRequest(Date.now())
  if (!request) return

  try {
    const response = await observeSession(request)
    console.log(`[HANDOFF] Session observed (${reason}):`, response)

    // 호출 후 카운터 리셋
    promptsSinceLastObserve = 0
  } catch (err) {
    console.error('[HANDOFF] Failed to observe session:', err)
  }
}

// 조건부 observe 호출 체크
async function checkObserveConditions(event: AgentEvent) {
  if (!currentSessionId) return

  // 1. refinement loop 감지 시 즉시 호출
  if (event.type === 'PROMPT_SUBMIT' && userMessageTimestamps.length >= 2) {
    const lastTwo = userMessageTimestamps.slice(-2)
    if (lastTwo[1] - lastTwo[0] < OBSERVE_CONDITIONS.refinementIntervalSec * 1000) {
      await callObserveAPI('refinement loop detected')
      return
    }
  }

  // 2. N회 프롬프트 누적 시 호출
  if (promptsSinceLastObserve >= OBSERVE_CONDITIONS.promptThreshold) {
    await callObserveAPI(`${OBSERVE_CONDITIONS.promptThreshold} prompts accumulated`)
    return
  }

  // 3. idle timeout 타이머 설정 (마지막 활동 후 X초)
  if (idleCheckTimer) {
    clearTimeout(idleCheckTimer)
  }
  idleCheckTimer = setTimeout(async () => {
    if (currentSessionId && promptsSinceLastObserve > 0) {
      await callObserveAPI('idle timeout')
    }
  }, OBSERVE_CONDITIONS.idleTimeoutSec * 1000)
}

// 이벤트 저장
async function saveEvent(event: AgentEvent) {
  const result = await chrome.storage.local.get('events') as { events?: AgentEvent[] }
  const events = result.events ?? []

  // 새 이벤트 추가 (최신이 앞으로)
  const updatedEvents = [event, ...events].slice(0, MAX_EVENTS)

  await chrome.storage.local.set({ events: updatedEvents })

  // 현재 상태 업데이트
  await updateStatus(event)

  // 타임라인에 이벤트 추가 (세션 시작/종료 제외)
  if (event.type !== 'SESSION_START' && event.type !== 'SESSION_END') {
    interactionTimeline.push({
      type: event.type,
      domain: event.platform,
      timestamp: new Date(event.timestamp).toISOString()
    })
  }

  // 사용자 메시지 시간 기록
  if (event.type === 'PROMPT_SUBMIT') {
    userMessageTimestamps.push(event.timestamp)
    promptsSinceLastObserve++
  }

  if (event.type === 'SESSION_START') {
    // 플랫폼 추가
    activePlatforms.add(event.platform)

    // 세션이 없으면 새로 시작
    if (!currentSessionId) {
      sessionStartTime = new Date(event.timestamp).toISOString()
      userMessageTimestamps = []
      interactionTimeline = []
      promptsSinceLastObserve = 0

      if (idleCheckTimer) {
        clearTimeout(idleCheckTimer)
        idleCheckTimer = null
      }

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
    } else {
      // 기존 세션에 새 플랫폼 추가
      console.log(`[HANDOFF] Platform ${event.platform} added to existing session ${currentSessionId}`)
    }
  }

  // 조건부 observe 체크
  if (event.type !== 'SESSION_START' && event.type !== 'SESSION_END') {
    await checkObserveConditions(event)
  }

  // 세션 종료 시: 해당 플랫폼만 제거, 모든 플랫폼이 종료되면 세션 종료
  if (event.type === 'SESSION_END') {
    activePlatforms.delete(event.platform)
    console.log(`[HANDOFF] Platform ${event.platform} removed. Active platforms: ${Array.from(activePlatforms).join(', ') || 'none'}`)

    // 모든 플랫폼이 종료되면 세션 종료
    if (activePlatforms.size === 0) {
      if (idleCheckTimer) {
        clearTimeout(idleCheckTimer)
        idleCheckTimer = null
      }

      if (currentSessionId && sessionStartTime) {
        await callObserveAPI('all platforms closed')
      }

      // 세션은 유지하되 데이터만 정리 (sessionId는 유지)
      // 사용자가 analyze 버튼을 누르기 전까지 sessionId 유지
      console.log(`[HANDOFF] All platforms closed. Session ${currentSessionId} ready for analysis.`)
    }
  }
}

// 상태 업데이트
async function updateStatus(event: AgentEvent) {
  const statusMap: Record<EventType, string> = {
    'SESSION_START': 'Observing',
    'SESSION_END': 'Inactive',
    'PROMPT_SUBMIT': 'Observing',
    'AI_RESPONSE_START': 'Approaching Decision Boundary',
    'AI_RESPONSE_END': 'Observing'
  }

  const riskMap: Record<EventType, string> = {
    'SESSION_START': 'Low',
    'SESSION_END': 'Low',
    'PROMPT_SUBMIT': 'Medium',
    'AI_RESPONSE_START': 'High',
    'AI_RESPONSE_END': 'Low'
  }

  await chrome.storage.local.set({
    agentStatus: statusMap[event.type],
    decisionRisk: riskMap[event.type],
    lastActivity: event.timestamp,
    activePlatform: event.platform,
    activePlatforms: Array.from(activePlatforms)
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
    chrome.storage.local.get(['events', 'agentStatus', 'decisionRisk', 'activePlatform', 'activePlatforms'])
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

  // 세션 리셋 (분석 완료 후 새 세션 시작을 위해)
  if (message.type === 'RESET_SESSION') {
    currentSessionId = null
    sessionStartTime = null
    activePlatforms.clear()
    userMessageTimestamps = []
    interactionTimeline = []
    promptsSinceLastObserve = 0
    if (idleCheckTimer) {
      clearTimeout(idleCheckTimer)
      idleCheckTimer = null
    }
    chrome.storage.local.remove('sessionId')
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
    activePlatform: null,
    activePlatforms: []
  })
  console.log('[HANDOFF] Extension installed')
})

console.log('[HANDOFF] Background script loaded')
