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
import { loadRecord, newSessionId, saveRecord } from '../local/store'
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
