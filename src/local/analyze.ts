/**
 * 협업 스타일 분석 (브라우저 안에서 실행).
 *
 * 예전 백엔드의 분석 파이프라인(spoon-service/graph/collaboration_graph.py)과 같은 규칙을 쓴다:
 *   메트릭 추출 → 패턴 분석 → 행동 점수화 → (LLM 인사이트) → 스타일 결정 → 리포트 생성
 *
 * 해커톤 버전(서버)에서 바꾼 점:
 *  - 서버는 observe 호출마다 누적 타임라인을 다시 저장해서 프롬프트 수가 실제보다 크게 집계됐다.
 *    여기서는 실제 프롬프트 수를 그대로 쓴다.
 *  - "질문 간격"을 질문→질문 시간이 아니라, AI 답변이 끝난 뒤 다음 질문까지의 시간(생각 시간)으로 잰다.
 *    예전 방식은 AI가 답을 쓰는 시간과 쉬는 시간이 섞여서 거의 모든 사람이 "간격 김"으로 나왔다.
 *  - 10분 넘게 쉬면 대화가 끊긴 것으로 보고, 그 공백은 간격 계산에서 뺀다.
 *  - 질문 횟수는 세션 전체 합계가 아니라 "한 번 대화를 시작했을 때 이어서 몇 번 묻는가"로 본다.
 *    세션 길이(오래 켜 둘수록 커짐)에 결과가 좌우되지 않게 하기 위해서다.
 *  - 스타일은 고정 가산점 대신 두 축(생각 속도, 대화 깊이)에서 각 스타일 기준점까지의 거리로 정한다.
 *    가운데는 Balanced, 네 방향 끝은 각 스타일이 되도록 해서 특정 유형으로 쏠리지 않게 했다.
 *  - 의사결정 이벤트 수는 대시보드 타임라인에 표시되는 구간 수와 같은 값을 쓴다
 *    (서버에서는 항상 0으로 집계되던 값).
 */
import { INTENTS, INTENT_LABELS, INTENT_STYLE_WEIGHTS, type Intent } from './intent'
import type {
  DataSummary,
  DetailSummary,
  GraphMetrics,
  GraphPatterns,
  InteractionTimelineItem,
  SessionGraphData,
  SessionResultData,
  SurveyResultData,
  TimelineEvent,
} from '../types/session'
import {
  EVENT_LABEL_TEXT,
  FALLBACK_INSIGHT_TEXT,
  INTERVAL_PATTERN_TEXT,
  PATTERN_INSIGHT_TEXT,
  PROMPT_PATTERN_TEXT,
  REFINEMENT_PATTERN_TEXT,
  STYLE_INFO,
  STYLE_NAMES,
  toTypeCode,
  type IntervalLevel,
  type Lang,
  type Level3,
  type StyleName,
  type TypeCode,
} from './texts'
import { TYPE_CONTENTS } from './typeContents'

/** 이보다 오래 쉬면 대화가 끊긴 것으로 본다 */
export const IDLE_GAP_MS = 10 * 60_000
/** 답변이 끝나고 이 시간 안에 다시 물으면 "읽자마자 고쳐 묻기(수정·재질문)"로 본다 */
export const QUICK_FOLLOWUP_SEC = 20

/** 생각 시간이 이 값이면 "빠름" 끝(1), 이 값이면 "느림" 끝(0). 그 사이는 로그 스케일 */
const FAST_THINK_SEC = 8
const SLOW_THINK_SEC = 90
/** 한 대화에서 이어서 묻는 횟수가 1이면 깊이 0, 이 값 이상이면 1 */
const DEEP_CHAIN = 6

/** 두 축(speed: 생각 속도, depth: 대화 깊이) 위의 스타일 기준점 */
const PROTOTYPES: Record<StyleName, { speed: number; depth: number }> = {
  'AI-Driven Executor': { speed: 1, depth: 0.85 },
  'AI-Assisted Thinker': { speed: 0, depth: 0.85 },
  'AI Checker': { speed: 0.5, depth: 0 },
  'Balanced Collaborator': { speed: 0.5, depth: 0.45 },
}
/** 기준점에서 멀어질수록 점수가 줄어드는 폭 */
const SPREAD = 0.3

/** 상세 분석: 요청 유형 점수를 시간 기반 점수와 섞는 최대 비율 (분류된 질문이 10개 이상일 때) */
const MAX_INTENT_WEIGHT = 0.5
const FULL_INTENT_PROMPTS = 10
/** 이 길이 이상 답변을 SKIM_SEC 안에 넘기면 "읽지 않고 넘김"으로 센다 */
const LONG_ANSWER_CHARS = 1500
const SKIM_SEC = 5

export const GRAPH_NODES = [
  'extract_metrics',
  'analyze_patterns',
  'behavior_scoring',
  'llm_analysis',
  'determine_style',
  'generate_report',
]

export type BatchType = 'REFINEMENT_LOOP' | 'RAPID_INTERACTION' | 'INTERACTION_SUMMARY' | 'SINGLE_INTERACTION'

/** observe 시점마다 남기는 요약 한 건 (대시보드 타임라인의 한 구간이 된다) */
export interface ObserveBatch {
  at: string // ISO 시각
  type: BatchType
  /** 세션 시작부터의 누적 값 (해커톤 버전 호환) */
  promptCount: number
  avgIntervalSec: number
  refinement: boolean
}

/** 타임라인의 한 구간: 10분 넘게 쉬기 전까지 이어진 대화 한 덩어리 */
export interface TimelineSegment {
  start: string // ISO
  end: string // ISO
  prompts: number
  /** 답변이 끝난 뒤 다음 질문까지 평균 시간 (질문이 하나면 null) */
  avgThinkSec: number | null
  /** 답변 후 20초 안에 다시 물은 횟수 */
  quickFollowups: number
  /** 사용한 사이트 */
  tools: string[]
  /** 상세 분석을 켠 경우 요청 유형별 개수 */
  intents?: Partial<Record<Intent, number>>
}

/** 타임라인을 대화 덩어리로 나눈다 */
export function buildSegments(timeline: InteractionTimelineItem[]): TimelineSegment[] {
  const items = timeline
    .map((item) => ({ ...item, time: Date.parse(item.timestamp) }))
    .filter((item) => !Number.isNaN(item.time))
    .sort((a, b) => a.time - b.time)

  const segments: TimelineSegment[] = []
  let current: (TimelineSegment & { thinks: number[]; endTime: number; lastPrompt: number; lastEnd: number | null }) | null = null
  const close = () => {
    if (!current) return
    const { thinks, endTime, lastPrompt, lastEnd, ...segment } = current
    void lastPrompt
    void lastEnd
    segment.avgThinkSec = thinks.length > 0 ? round2(thinks.reduce((a, b) => a + b, 0) / thinks.length) : null
    segment.end = new Date(endTime).toISOString()
    segments.push(segment)
    current = null
  }

  for (const item of items) {
    if (item.type === 'AI_RESPONSE_END') {
      if (current && item.time - current.lastPrompt <= IDLE_GAP_MS) {
        current.lastEnd = item.time
        current.endTime = Math.max(current.endTime, item.time)
      }
      continue
    }
    if (item.type !== 'PROMPT_SUBMIT') continue
    if (!current || item.time - Math.max(current.lastPrompt, current.lastEnd ?? 0) > IDLE_GAP_MS) {
      close()
      current = {
        start: item.timestamp, end: item.timestamp, prompts: 0, avgThinkSec: null, quickFollowups: 0, tools: [],
        thinks: [], endTime: item.time, lastPrompt: item.time, lastEnd: null,
      }
    } else {
      const base = current.lastEnd !== null && current.lastEnd > current.lastPrompt ? current.lastEnd : current.lastPrompt
      const sec = (item.time - base) / 1000
      current.thinks.push(sec)
      if (sec < QUICK_FOLLOWUP_SEC) current.quickFollowups++
    }
    current.prompts++
    current.lastPrompt = item.time
    current.endTime = Math.max(current.endTime, item.time)
    const tool = normalizeDomain(item.domain ?? '')
    if (tool && !current.tools.includes(tool)) current.tools.push(tool)
    if (item.intent) {
      current.intents = current.intents ?? {}
      current.intents[item.intent] = (current.intents[item.intent] ?? 0) + 1
    }
  }
  close()
  return segments
}

/** 언어와 무관한 분석 결과. 화면에 보여 줄 때 언어별 문구를 입힌다. */
export interface Analysis {
  style: StyleName
  /** 스타일을 정한 두 축 (0~1) */
  axes?: { speed: number; depth: number }
  /** 상세 분석 결과 (동의하고 기록한 질문이 있을 때만) */
  detail?: DetailSummary
  /** 타임라인 구간 (예전 결과에는 없을 수 있음) */
  segments?: TimelineSegment[]
  relativeStyles: Record<StyleName, number>
  levels: {
    prompt: Level3
    interval: IntervalLevel
    refinement: Level3
    decision: Level3
  }
  metrics: GraphMetrics
  batches: ObserveBatch[]
  aiToolUsage: Record<string, number>
  executionTime: number
}

export function classifyBatch(promptCount: number, avgIntervalSec: number, refinement: boolean): BatchType {
  if (refinement) return 'REFINEMENT_LOOP'
  if (promptCount >= 5 && avgIntervalSec < 10) return 'RAPID_INTERACTION'
  if (promptCount >= 3) return 'INTERACTION_SUMMARY'
  return 'SINGLE_INTERACTION'
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function normalizeDomain(domain: string): string | null {
  const d = domain.toLowerCase()
  if (d.includes('openai') || d.includes('chatgpt')) return 'chatgpt'
  if (d.includes('claude')) return 'claude'
  if (d.includes('gemini')) return 'gemini'
  if (d.includes('copilot')) return 'copilot'
  return null
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function rateLevel(rate: number): Level3 {
  if (rate > 0.3) return 'high'
  if (rate > 0.1) return 'medium'
  return 'low'
}

const PROMPT_SCORE: Record<Level3, number> = { high: 0.9, medium: 0.5, low: 0.2 }
const INTERVAL_SCORE: Record<IntervalLevel, number> = { short: 0.9, medium: 0.5, long: 0.2 }
const REFINEMENT_SCORE: Record<Level3, number> = { high: 0.8, medium: 0.5, low: 0.2 }

/** 타임라인과 observe 요약으로부터 협업 스타일을 계산한다 */
export function analyze(timeline: InteractionTimelineItem[], batches: ObserveBatch[]): Analysis {
  const startedAt = performance.now()

  // 1. 메트릭 추출
  const times = (type: string) =>
    timeline
      .filter((item) => item.type === type)
      .map((item) => Date.parse(item.timestamp))
      .filter((time) => !Number.isNaN(time))
      .sort((a, b) => a - b)
  const promptTimes = times('PROMPT_SUBMIT')
  const responseEnds = times('AI_RESPONSE_END')
  const responseLengthAt = new Map<number, number>()
  for (const item of timeline) {
    if (item.type === 'AI_RESPONSE_END' && typeof item.responseLength === 'number') {
      responseLengthAt.set(Date.parse(item.timestamp), item.responseLength)
    }
  }
  let longAnswers = 0
  let skimmedAnswers = 0

  const totalPrompts = promptTimes.length
  let episodes = totalPrompts > 0 ? 1 : 0
  const thinkTimes: number[] = []
  let endIndex = 0
  for (let i = 1; i < promptTimes.length; i++) {
    const previous = promptTimes[i - 1]
    const current = promptTimes[i]
    // 직전 질문과 이번 질문 사이에 끝난 마지막 AI 답변
    let lastEnd: number | null = null
    while (endIndex < responseEnds.length && responseEnds[endIndex] <= current) {
      if (responseEnds[endIndex] > previous) lastEnd = responseEnds[endIndex]
      endIndex++
    }
    if (current - previous > IDLE_GAP_MS) {
      episodes++
      continue
    }
    const thinkSec = (current - (lastEnd ?? previous)) / 1000
    thinkTimes.push(thinkSec)
    const answerLength = lastEnd !== null ? responseLengthAt.get(lastEnd) : undefined
    if (answerLength !== undefined && answerLength >= LONG_ANSWER_CHARS) {
      longAnswers++
      if (thinkSec < SKIM_SEC) skimmedAnswers++
    }
  }

  const avgInterval = thinkTimes.length > 0 ? round2(thinkTimes.reduce((a, b) => a + b, 0) / thinkTimes.length) : 0
  const refinementLoops = thinkTimes.filter((sec) => sec < QUICK_FOLLOWUP_SEC).length
  const chainLength = episodes > 0 ? totalPrompts / episodes : 0

  const decisionBatches = batches.filter((batch) => batch.type !== 'SINGLE_INTERACTION')
  // 타임라인 구간: 10분 넘게 쉬기 전까지 이어진 대화 한 덩어리
  const segments = buildSegments(timeline)
  const eventCount = timeline.length

  const eventTypeDistribution: Record<string, number> = {}
  for (const item of timeline) {
    eventTypeDistribution[item.type] = (eventTypeDistribution[item.type] ?? 0) + 1
  }

  const metrics: GraphMetrics = {
    totalPrompts,
    avgInterval,
    refinementLoops,
    decisionBoundaries: segments.length,
    avgPromptLength: 0, // 프롬프트 내용은 수집하지 않는다
    eventCount,
    eventTypeDistribution,
  }

  // 2. 패턴 분석: 두 축으로 정리
  //    speed: 답을 받고 얼마나 빨리 다음 행동으로 넘어가는가 (1 = 바로, 0 = 오래 생각)
  //    depth: 한 번 시작하면 얼마나 길게 이어서 묻는가 (1 = 길게, 0 = 한두 번 묻고 끝)
  const speed = thinkTimes.length > 0
    ? clamp01((Math.log(SLOW_THINK_SEC) - Math.log(Math.max(avgInterval, 1))) / (Math.log(SLOW_THINK_SEC) - Math.log(FAST_THINK_SEC)))
    : 0.5
  const depth = clamp01((chainLength - 1) / (DEEP_CHAIN - 1))

  const prompt: Level3 = depth >= 0.6 ? 'high' : depth >= 0.25 ? 'medium' : 'low'
  const interval: IntervalLevel = thinkTimes.length === 0 ? 'medium' : avgInterval < 15 ? 'short' : avgInterval < 60 ? 'medium' : 'long'
  const refinement = thinkTimes.length === 0 ? 'low' : rateLevel(refinementLoops / thinkTimes.length)
  const decision = rateLevel(segments.length / Math.max(eventCount, 1))

  // 3. 행동 점수화: 각 스타일 기준점과의 거리
  const scores = {} as Record<StyleName, number>
  for (const name of STYLE_NAMES) {
    const p = PROTOTYPES[name]
    const distance2 = (speed - p.speed) ** 2 + (depth - p.depth) ** 2
    scores[name] = Math.exp(-distance2 / (2 * SPREAD * SPREAD))
  }
  const total = STYLE_NAMES.reduce((sum, name) => sum + scores[name], 0)
  for (const name of STYLE_NAMES) {
    scores[name] = total > 0 ? scores[name] / total : 0.25
  }

  // 3-1. 상세 분석: 요청 유형이 가리키는 스타일 점수를 섞는다
  const intentCounts = Object.fromEntries([...INTENTS, 'other'].map((intent) => [intent, 0])) as Record<Intent, number>
  const promptLengths: number[] = []
  for (const item of timeline) {
    if (item.type !== 'PROMPT_SUBMIT' || !item.intent) continue
    intentCounts[item.intent] = (intentCounts[item.intent] ?? 0) + 1
    if (typeof item.length === 'number') promptLengths.push(item.length)
  }
  const detailPrompts = Object.values(intentCounts).reduce((a, b) => a + b, 0)
  const classified = detailPrompts - intentCounts.other
  if (classified > 0) {
    const intentScores = Object.fromEntries(STYLE_NAMES.map((name) => [name, 0])) as Record<StyleName, number>
    for (const intent of INTENTS) {
      for (const [name, weight] of Object.entries(INTENT_STYLE_WEIGHTS[intent])) {
        intentScores[name as StyleName] += (weight ?? 0) * intentCounts[intent]
      }
    }
    const weight = MAX_INTENT_WEIGHT * Math.min(1, classified / FULL_INTENT_PROMPTS)
    for (const name of STYLE_NAMES) {
      scores[name] = (1 - weight) * scores[name] + weight * (intentScores[name] / classified)
    }
  }
  for (const name of STYLE_NAMES) scores[name] = round2(scores[name])
  if (promptLengths.length > 0) {
    metrics.avgPromptLength = round2(promptLengths.reduce((a, b) => a + b, 0) / promptLengths.length)
  }
  const detail: DetailSummary | undefined = detailPrompts > 0
    ? { prompts: detailPrompts, intents: intentCounts, avgPromptLength: metrics.avgPromptLength, skimmedAnswers, longAnswers }
    : undefined

  // 5. 스타일 결정: 점수가 가장 높은 스타일 (동점이면 앞 순서)
  let style: StyleName = STYLE_NAMES[0]
  for (const name of STYLE_NAMES) {
    if (scores[name] > scores[style]) style = name
  }
  if (totalPrompts === 0) style = 'Balanced Collaborator'

  // AI 도구별 사용 비율
  const toolCounts: Record<string, number> = {}
  let toolTotal = 0
  for (const item of timeline) {
    const tool = normalizeDomain(item.domain ?? '')
    if (!tool) continue
    toolCounts[tool] = (toolCounts[tool] ?? 0) + 1
    toolTotal++
  }
  const aiToolUsage: Record<string, number> = {}
  for (const [tool, count] of Object.entries(toolCounts)) {
    aiToolUsage[tool] = round2(count / toolTotal)
  }

  return {
    style,
    axes: { speed: round2(speed), depth: round2(depth) },
    detail,
    segments,
    relativeStyles: scores,
    levels: { prompt, interval, refinement, decision },
    metrics,
    batches: decisionBatches,
    aiToolUsage,
    executionTime: Math.round(performance.now() - startedAt) / 1000,
  }
}

function dataSummary(analysis: Analysis): DataSummary {
  return {
    aiUsageFrequency: analysis.levels.prompt,
    avgPromptInterval: analysis.levels.interval,
    refinementRate: analysis.levels.refinement,
    decisionEventFrequency: analysis.levels.decision,
  }
}

function formatTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const TOOL_DISPLAY: Record<string, string> = { chatgpt: 'ChatGPT', claude: 'Claude', gemini: 'Gemini', copilot: 'Copilot' }

function segmentLabel(seg: TimelineSegment, lang: Lang): string {
  const text = EVENT_LABEL_TEXT[lang]
  const followups = seg.prompts - 1
  if (followups >= 1 && seg.quickFollowups / followups >= 0.5) return text.quickRetry
  if (seg.avgThinkSec !== null && seg.avgThinkSec >= 60) return text.thoughtful
  if (seg.prompts >= 3) return text.chain
  if (seg.prompts === 1) return text.single
  return text.fewTurns
}

function segmentSummary(seg: TimelineSegment, lang: Lang): string {
  const text = EVENT_LABEL_TEXT[lang]
  const parts = [text.prompts(seg.prompts)]
  if (seg.avgThinkSec !== null) parts.push(text.think(Math.round(seg.avgThinkSec)))
  if (seg.tools.length > 0) parts.push(seg.tools.map((tool) => TOOL_DISPLAY[tool] ?? tool).join(', '))
  if (seg.intents) {
    const intents = INTENTS.filter((intent) => (seg.intents?.[intent] ?? 0) > 0)
      .map((intent) => `${INTENT_LABELS[lang][intent]} ${seg.intents?.[intent]}`)
    if (intents.length > 0) parts.push(intents.join(', '))
  }
  return parts.join(' · ')
}

/** 예전 결과(구간 정보 없음)용 */
function legacyBatchLabel(batch: ObserveBatch, lang: Lang): string {
  const text = EVENT_LABEL_TEXT[lang]
  if (batch.refinement) return text.refinement
  if (batch.promptCount >= 3) {
    return batch.avgIntervalSec < 10 ? text.delegation : text.careful(batch.promptCount)
  }
  return text.interaction
}

function timelineEvents(analysis: Analysis, lang: Lang): TimelineEvent[] {
  if (analysis.segments) {
    return analysis.segments.map((seg) => ({
      start: formatTime(new Date(seg.start)),
      end: formatTime(new Date(seg.end)),
      label: segmentLabel(seg, lang),
      summary: segmentSummary(seg, lang),
    }))
  }
  return analysis.batches.map((batch) => {
    const start = new Date(batch.at)
    return {
      start: formatTime(start),
      end: formatTime(new Date(start.getTime() + 5 * 60_000)),
      label: legacyBatchLabel(batch, lang),
    }
  })
}

/** 대시보드용 결과 */
export function toResult(sessionId: string, analysis: Analysis, lang: Lang): SessionResultData {
  const info = STYLE_INFO[lang][analysis.style]
  const typeCode = toTypeCode(analysis.style)
  return {
    sessionId,
    totalPrompts: analysis.metrics.totalPrompts,
    primaryStyle: { typeCode, displayName: analysis.style, description: info.description },
    styleDetail: TYPE_CONTENTS[typeCode][lang],
    dataSummary: dataSummary(analysis),
    strengths: info.strengths,
    cautions: info.cautions,
    dailyTimeline: {
      decisionCount: analysis.segments?.length ?? analysis.batches.length,
      events: timelineEvents(analysis, lang),
    },
    roleDistribution: null,
    relativeStyles: analysis.relativeStyles,
    aiToolUsage: analysis.aiToolUsage,
  }
}

function patterns(analysis: Analysis, lang: Lang): GraphPatterns {
  const { prompt, interval, refinement } = analysis.levels
  return {
    prompt: { level: prompt, score: PROMPT_SCORE[prompt], description: PROMPT_PATTERN_TEXT[lang][prompt] },
    interval: { level: interval, score: INTERVAL_SCORE[interval], description: INTERVAL_PATTERN_TEXT[lang][interval] },
    refinement: { level: refinement, score: REFINEMENT_SCORE[refinement], description: REFINEMENT_PATTERN_TEXT[lang][refinement] },
  }
}

function patternInsights(analysis: Analysis, lang: Lang): string[] {
  const text = PATTERN_INSIGHT_TEXT[lang]
  const { prompt, interval, refinement } = analysis.levels
  const insights: string[] = []
  if (prompt === 'high') insights.push(text.promptHigh)
  else if (prompt === 'low') insights.push(text.promptLow)
  if (interval === 'short') insights.push(text.intervalShort)
  else if (interval === 'long') insights.push(text.intervalLong)
  if (refinement === 'high') insights.push(text.refinementHigh)
  const detail = analysis.detail
  if (detail && detail.prompts >= 3) {
    const top = INTENTS.reduce((best, intent) => (detail.intents[intent] > detail.intents[best] ? intent : best), INTENTS[0])
    if (detail.intents[top] > 0) insights.push(text.topIntent[top](Math.round((detail.intents[top] / detail.prompts) * 100)))
    if (detail.skimmedAnswers > 0) insights.push(text.skimmed(detail.skimmedAnswers, detail.longAnswers))
  }
  if (insights.length === 0) insights.push(text.balanced)
  return insights
}

/** LLM을 쓸 수 없을 때의 규칙 기반 인사이트 */
export function fallbackInsights(analysis: Analysis, lang: Lang): string[] {
  const text = FALLBACK_INSIGHT_TEXT[lang]
  const { totalPrompts, avgInterval } = analysis.metrics
  const insights: string[] = []
  const { prompt, interval } = analysis.levels
  if (prompt === 'high' && totalPrompts >= 10) insights.push(text.active)
  else if (prompt === 'low') insights.push(text.selective)
  if (interval === 'short' && avgInterval > 0) insights.push(text.quick)
  else if (interval === 'long') insights.push(text.careful)
  if (insights.length === 0) insights.push(text.balanced)
  return insights
}

/** 리포트용 결과. llmInsights가 없으면 규칙 기반 인사이트를 쓴다. */
export function toGraph(
  sessionId: string,
  analysis: Analysis,
  lang: Lang,
  llmInsights?: string[],
): SessionGraphData {
  return {
    sessionId,
    graphExecution: {
      nodesExecuted: GRAPH_NODES,
      executionTime: analysis.executionTime,
      errors: [],
    },
    metrics: analysis.metrics,
    patterns: patterns(analysis, lang),
    llmInsights: llmInsights && llmInsights.length > 0 ? llmInsights : fallbackInsights(analysis, lang),
    patternInsights: patternInsights(analysis, lang),
    detail: analysis.detail,
  }
}

/** 설문 결과: 유형 코드에 해당하는 고정 문구 */
export function toSurveyResult(typeCode: TypeCode, displayName: StyleName, lang: Lang): SurveyResultData {
  const detail = TYPE_CONTENTS[typeCode][lang]
  return {
    primaryStyle: { typeCode, displayName, description: detail.tagline },
    styleDetail: detail,
    dataSummary: {
      aiUsageFrequency: 'medium',
      avgPromptInterval: 'medium',
      refinementRate: 'medium',
      decisionEventFrequency: 'medium',
    },
    strengths: detail.detailStrengths,
    cautions: detail.detailCautions,
  }
}
