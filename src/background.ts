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

const IDLE_ALARM = 'handoff-idle-observe'
const TRACKING_KEY = 'tracking'

/**
 * 세션 추적 상태.
 *
 * MV3 서비스 워커는 약 30초간 이벤트가 없으면 종료되므로 전역 변수에 두면 사라진다.
 * 그래서 chrome.storage.session(브라우저를 닫으면 비워지는 메모리 저장소)에 보관하고,
 * 이벤트를 처리할 때마다 읽고 다시 쓴다.
 */
interface TrackingState {
  currentSessionId: string | null
  sessionStartTime: string | null
  activePlatforms: string[]
  userMessageTimestamps: number[]
  interactionTimeline: InteractionTimelineItem[]
  promptsSinceLastObserve: number
}

function emptyState(): TrackingState {
  return {
    currentSessionId: null,
    sessionStartTime: null,
    activePlatforms: [],
    userMessageTimestamps: [],
    interactionTimeline: [],
    promptsSinceLastObserve: 0
  }
}

async function loadState(): Promise<TrackingState> {
  const data = (await chrome.storage.session.get(TRACKING_KEY)) as { tracking?: TrackingState }
  return data.tracking ?? emptyState()
}

async function saveState(state: TrackingState): Promise<void> {
  await chrome.storage.session.set({ [TRACKING_KEY]: state })
}

// 여러 탭에서 이벤트가 동시에 들어와도 "읽기 → 수정 → 쓰기"가 섞이지 않도록 직렬 처리
let queue: Promise<unknown> = Promise.resolve()
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task)
  queue = run.catch(() => undefined)
  return run
}

// observe 요청 데이터 생성
function buildObserveRequest(state: TrackingState, endTime: number): SessionObserveRequest | null {
  if (!state.currentSessionId || !state.sessionStartTime || state.activePlatforms.length === 0) {
    return null
  }

  const timestamps = state.userMessageTimestamps

  // 평균 프롬프트 간격 계산
  let avgPromptIntervalSec = 0
  if (timestamps.length > 1) {
    const intervals: number[] = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push((timestamps[i] - timestamps[i - 1]) / 1000)
    }
    avgPromptIntervalSec = Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
  }

  // refinement loop 감지
  const refinementLoopDetected = timestamps.some((ts, i) => {
    if (i === 0) return false
    return (ts - timestamps[i - 1]) < OBSERVE_CONDITIONS.refinementIntervalSec * 1000
  })

  return {
    sessionId: state.currentSessionId,
    context: {
      // 사용된 모든 플랫폼을 쉼표로 연결
      domain: state.activePlatforms.join(','),
      sessionStartAt: state.sessionStartTime,
      sessionEndAt: new Date(endTime).toISOString()
    },
    interactionMetrics: {
      promptSubmitCount: timestamps.length,
      avgPromptIntervalSec,
      refinementLoopDetected
    },
    interactionTimeline: state.interactionTimeline
  }
}

// observe API 호출 (성공하면 카운터 리셋)
async function callObserveAPI(state: TrackingState, reason: string) {
  const request = buildObserveRequest(state, Date.now())
  if (!request) return

  try {
    const response = await observeSession(request)
    console.log(`[HANDOFF] Session observed (${reason}):`, response)
    state.promptsSinceLastObserve = 0
  } catch (err) {
    console.error('[HANDOFF] Failed to observe session:', err)
  }
}

// 조건부 observe 호출 체크
async function checkObserveConditions(state: TrackingState, event: AgentEvent) {
  if (!state.currentSessionId) return

  // 1. refinement loop 감지 시 즉시 호출
  if (event.type === 'PROMPT_SUBMIT' && state.userMessageTimestamps.length >= 2) {
    const lastTwo = state.userMessageTimestamps.slice(-2)
    if (lastTwo[1] - lastTwo[0] < OBSERVE_CONDITIONS.refinementIntervalSec * 1000) {
      await callObserveAPI(state, 'refinement loop detected')
      return
    }
  }

  // 2. N회 프롬프트 누적 시 호출
  if (state.promptsSinceLastObserve >= OBSERVE_CONDITIONS.promptThreshold) {
    await callObserveAPI(state, `${OBSERVE_CONDITIONS.promptThreshold} prompts accumulated`)
    return
  }

  // 3. idle timeout (마지막 활동 후 X초). setTimeout은 워커 종료 시 사라지므로 alarms 사용.
  //    같은 이름으로 다시 만들면 기존 알람이 교체된다.
  await chrome.alarms.create(IDLE_ALARM, { delayInMinutes: OBSERVE_CONDITIONS.idleTimeoutSec / 60 })
}

// 이벤트 처리
async function handleEvent(event: AgentEvent) {
  const result = await chrome.storage.local.get('events') as { events?: AgentEvent[] }
  const events = result.events ?? []

  // 새 이벤트 추가 (최신이 앞으로)
  const updatedEvents = [event, ...events].slice(0, MAX_EVENTS)
  await chrome.storage.local.set({ events: updatedEvents })

  const state = await loadState()
  const platforms = new Set(state.activePlatforms)

  // 타임라인에 이벤트 추가 (세션 시작/종료 제외)
  if (event.type !== 'SESSION_START' && event.type !== 'SESSION_END') {
    state.interactionTimeline.push({
      type: event.type,
      domain: event.platform,
      timestamp: new Date(event.timestamp).toISOString()
    })
  }

  // 사용자 메시지 시간 기록
  if (event.type === 'PROMPT_SUBMIT') {
    state.userMessageTimestamps.push(event.timestamp)
    state.promptsSinceLastObserve++
  }

  if (event.type === 'SESSION_START') {
    platforms.add(event.platform)
    state.activePlatforms = Array.from(platforms)

    // 세션이 없으면 새로 시작
    if (!state.currentSessionId) {
      state.sessionStartTime = new Date(event.timestamp).toISOString()
      state.userMessageTimestamps = []
      state.interactionTimeline = []
      state.promptsSinceLastObserve = 0
      await chrome.alarms.clear(IDLE_ALARM)

      try {
        const response = await startSession()
        if (response.isSuccess && response.result) {
          state.currentSessionId = response.result.sessionId
          await chrome.storage.local.set({ sessionId: state.currentSessionId })
          console.log('[HANDOFF] Session started with ID:', state.currentSessionId)
        }
      } catch (err) {
        console.error('[HANDOFF] Failed to start session:', err)
      }
    }
  }

  // 조건부 observe 체크
  if (event.type !== 'SESSION_START' && event.type !== 'SESSION_END') {
    await checkObserveConditions(state, event)
  }

  // 세션 종료 시: 해당 플랫폼만 제거, 모든 플랫폼이 종료되면 마지막 observe 전송
  if (event.type === 'SESSION_END') {
    if (platforms.size === 1 && platforms.has(event.platform)) {
      // 마지막 플랫폼이 닫히는 경우: 플랫폼 정보가 남아 있을 때 마지막 observe 전송
      await chrome.alarms.clear(IDLE_ALARM)
      if (state.currentSessionId && state.sessionStartTime) {
        await callObserveAPI(state, 'all platforms closed')
      }
      // 사용자가 분석을 요청할 때까지 sessionId는 유지
    }
    platforms.delete(event.platform)
    state.activePlatforms = Array.from(platforms)
  }

  await saveState(state)
  await updateStatus(event, state.activePlatforms)
}

// 상태 업데이트
async function updateStatus(event: AgentEvent, activePlatforms: string[]) {
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
    activePlatforms
  })
}

// 마지막 활동 후 idle timeout 경과 시 observe 전송
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== IDLE_ALARM) return
  enqueue(async () => {
    const state = await loadState()
    if (state.currentSessionId && state.promptsSinceLastObserve > 0) {
      await callObserveAPI(state, 'idle timeout')
      await saveState(state)
    }
  })
})

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AGENT_EVENT') {
    enqueue(() => handleEvent(message.payload))
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
    enqueue(async () => {
      await chrome.alarms.clear(IDLE_ALARM)
      await saveState(emptyState())
      await chrome.storage.local.remove('sessionId')
    })
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }))
    return true
  }
})

// 확장프로그램 설치 시 초기화 (업데이트 때는 기존 기록을 지우지 않는다)
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== chrome.runtime.OnInstalledReason.INSTALL) return
  chrome.storage.local.set({
    events: [],
    agentStatus: 'Inactive',
    decisionRisk: 'Low',
    activePlatform: null,
    activePlatforms: []
  })
  console.log('[HANDOFF] Extension installed')
})
