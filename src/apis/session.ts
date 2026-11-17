/**
 * 세션 API.
 *
 * 예전에는 백엔드 서버를 호출했지만, 지금은 모두 브라우저 안에서 처리한다
 * (기록은 chrome.storage.local에 저장, 분석은 src/local/analyze.ts).
 * 화면 쪽 코드를 바꾸지 않도록 함수 이름과 응답 형태(ApiResponse)는 그대로 유지했다.
 * 유일한 네트워크 호출은 analyzeSession 안의 LLM 인사이트 요청이다.
 */
import type {
  ApiResponse,
  SessionAnalyzeRequest,
  SessionAnalyzeResult,
  SessionGraphData,
  SessionObserveRequest,
  SessionObserveResult,
  SessionResultData,
  SessionStartResult,
  SurveyResultData,
} from '../types/agent'
import { analyze, classifyBatch, toGraph, toResult, toSurveyResult, type ObserveBatch } from '../local/analyze'
import { fetchLlmInsights } from '../local/insights'
import { listRecords, loadRecord, newSessionId, saveRecord } from '../local/store'
import { styleFromTypeCode, toLang, type TypeCode } from '../local/texts'

function ok<T>(result: T): ApiResponse<T> {
  return { isSuccess: true, code: 'COMMON200', message: 'OK', result }
}

function fail<T>(code: string, message: string): ApiResponse<T> {
  return { isSuccess: false, code, message, result: null as T }
}

export const startSession = async (): Promise<ApiResponse<SessionStartResult>> => {
  const sessionId = newSessionId()
  const startedAt = new Date().toISOString()
  await saveRecord({ sessionId, startedAt, timeline: [], batches: [] })
  return ok({ sessionId, status: 'ACTIVE', startedAt })
}

export const observeSession = async (request: SessionObserveRequest): Promise<ApiResponse<SessionObserveResult>> => {
  const { promptSubmitCount, avgPromptIntervalSec, refinementLoopDetected } = request.interactionMetrics
  const now = new Date().toISOString()

  const record = (await loadRecord(request.sessionId)) ?? {
    sessionId: request.sessionId,
    startedAt: request.context.sessionStartAt || now,
    timeline: [],
    batches: [],
  }

  const batch: ObserveBatch = {
    at: now,
    type: classifyBatch(promptSubmitCount, avgPromptIntervalSec, refinementLoopDetected),
    promptCount: promptSubmitCount,
    avgIntervalSec: avgPromptIntervalSec,
    refinement: refinementLoopDetected,
  }

  // 타임라인은 누적본이 매번 통째로 오므로 교체하고, 요약만 덧붙인다
  record.timeline = request.interactionTimeline
  record.batches = [...record.batches, batch]
  await saveRecord(record)

  return ok({
    status: 'OBSERVED',
    agentState: refinementLoopDetected
      ? 'INTERVENTION_NEEDED'
      : avgPromptIntervalSec < 5
        ? 'RAPID_USAGE_DETECTED'
        : 'INTERACTION_SUMMARY',
    agentEvent: {
      type: batch.type,
      startTime: request.interactionTimeline[0]?.timestamp ?? now,
      endTime: now,
      summary: '',
    },
  })
}

export const analyzeSession = async (request: SessionAnalyzeRequest): Promise<ApiResponse<SessionAnalyzeResult>> => {
  const record = await loadRecord(request.sessionId)
  if (!record) return fail('SESSION404', 'Session not found')

  const lang = toLang(request.language)
  const analysis = analyze(record.timeline, record.batches)
  const insights = await fetchLlmInsights(analysis, lang)

  record.analysis = analysis
  record.analyzedAt = new Date().toISOString()
  record.llmInsights = insights ? { [lang]: insights } : {}
  await saveRecord(record)

  return ok({ sessionId: record.sessionId, status: 'ANALYZED', message: 'OK' })
}

const RESULT_ID_KEY = 'resultId'

function localDay(time: number): string {
  const d = new Date(time)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 결과 화면용: 세션이 아니라 "하루" 단위로 분석한다.
 * 확장 프로그램을 새로고침하거나 브라우저를 다시 켜면 세션이 새로 시작되므로,
 * 저장된 모든 세션의 기록을 합쳐 가장 최근에 질문한 날(보통 오늘)의 기록만 분석한다.
 * 결과는 'day-YYYY-MM-DD' 기록으로 저장하고, 그 ID를 돌려준다. 기록이 없으면 null.
 */
export const analyzeLatestDay = async (language?: string): Promise<string | null> => {
  // 아직 저장하지 않은 최신 기록부터 저장
  await chrome.runtime.sendMessage({ type: 'FLUSH_SESSION' }).catch(() => undefined)

  const records = (await listRecords()).filter((record) => !record.sessionId.startsWith('day-'))
  const seen = new Set<string>()
  const items = records.flatMap((record) => record.timeline).filter((item) => {
    const key = `${item.type}|${item.timestamp}|${item.domain}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  const promptTimes = items.filter((item) => item.type === 'PROMPT_SUBMIT').map((item) => Date.parse(item.timestamp)).filter((t) => !Number.isNaN(t))
  if (promptTimes.length === 0) return null

  const day = localDay(Math.max(...promptTimes))
  const dayItems = items.filter((item) => localDay(Date.parse(item.timestamp)) === day)
  const lang = toLang(language)
  const analysis = analyze(dayItems, [])
  const insights = await fetchLlmInsights(analysis, lang)

  const id = `day-${day}`
  const now = new Date().toISOString()
  await saveRecord({
    sessionId: id,
    startedAt: now,
    timeline: [],
    batches: [],
    analysis,
    analyzedAt: now,
    llmInsights: insights ? { [lang]: insights } : {},
  })
  await chrome.storage.local.set({ [RESULT_ID_KEY]: id })
  return id
}

/** 가장 최근에 분석한 결과 ID (없으면 null) */
export const getLatestResultId = async (): Promise<string | null> => {
  const data = (await chrome.storage.local.get(RESULT_ID_KEY)) as { resultId?: string }
  return data.resultId ?? null
}

export const getSessionResult = async (sessionId: string, language?: string): Promise<ApiResponse<SessionResultData>> => {
  const record = await loadRecord(sessionId)
  if (!record) return fail('SESSION404', 'Session not found')
  if (!record.analysis) return fail('SESSION400', 'Session not analyzed')
  return ok(toResult(sessionId, record.analysis, toLang(language)))
}

export const getSessionGraph = async (sessionId: string, language?: string): Promise<ApiResponse<SessionGraphData>> => {
  const record = await loadRecord(sessionId)
  if (!record) return fail('SESSION404', 'Session not found')
  if (!record.analysis) return fail('SESSION400', 'Session not analyzed')
  const lang = toLang(language)
  return ok({ ...toGraph(sessionId, record.analysis, lang, record.llmInsights?.[lang]), analyzedAt: record.analyzedAt })
}

export const getSurveyResult = async (typeCode: string, language?: string): Promise<ApiResponse<SurveyResultData>> => {
  const style = styleFromTypeCode(typeCode)
  if (!style) return fail('TYPE404', 'Unknown collaboration type')
  return ok(toSurveyResult(typeCode as TypeCode, style, toLang(language)))
}
