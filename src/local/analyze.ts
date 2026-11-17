/**
 * 협업 스타일 분석 (브라우저 안에서 실행).
 *
 * 예전 백엔드의 분석 파이프라인(spoon-service/graph/collaboration_graph.py)과 같은 규칙을 쓴다:
 *   메트릭 추출 → 패턴 분석 → 행동 점수화 → (LLM 인사이트) → 스타일 결정 → 리포트 생성
 *
 * 서버 버전과 다른 점:
 *  - 서버는 observe 호출마다 누적 타임라인을 다시 저장해서 프롬프트 수가 실제보다 크게 집계됐다.
 *    여기서는 실제 프롬프트 수를 그대로 쓴다.
 *  - 수정 반복 횟수는 "30초 안에 이어 보낸 프롬프트 쌍의 수"로 센다.
 *  - 의사결정 이벤트 수는 대시보드 타임라인에 표시되는 구간 수와 같은 값을 쓴다
 *    (서버에서는 항상 0으로 집계되던 값).
 */
import type {
  DataSummary,
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

/** 30초 안에 이어 보낸 프롬프트는 "수정·재질문"으로 본다 (background.ts와 같은 기준) */
export const REFINEMENT_INTERVAL_MS = 30_000

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
  promptCount: number
  avgIntervalSec: number
  refinement: boolean
}

/** 언어와 무관한 분석 결과. 화면에 보여 줄 때 언어별 문구를 입힌다. */
export interface Analysis {
  style: StyleName
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
  const promptTimes = timeline
    .filter((item) => item.type === 'PROMPT_SUBMIT')
    .map((item) => Date.parse(item.timestamp))
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => a - b)

  const totalPrompts = promptTimes.length
  let avgInterval = 0
  let refinementLoops = 0
  if (promptTimes.length > 1) {
    let sum = 0
    for (let i = 1; i < promptTimes.length; i++) {
      const gap = promptTimes[i] - promptTimes[i - 1]
      sum += gap
      if (gap < REFINEMENT_INTERVAL_MS) refinementLoops++
    }
    avgInterval = round2(sum / (promptTimes.length - 1) / 1000)
  }

  const decisionBatches = batches.filter((batch) => batch.type !== 'SINGLE_INTERACTION')
  const eventCount = timeline.length + batches.length

  const eventTypeDistribution: Record<string, number> = {}
  for (const item of timeline) {
    eventTypeDistribution[item.type] = (eventTypeDistribution[item.type] ?? 0) + 1
  }
  for (const batch of batches) {
    eventTypeDistribution[batch.type] = (eventTypeDistribution[batch.type] ?? 0) + 1
  }

  const metrics: GraphMetrics = {
    totalPrompts,
    avgInterval,
    refinementLoops,
    decisionBoundaries: decisionBatches.length,
    avgPromptLength: 0, // 프롬프트 내용은 수집하지 않는다
    eventCount,
    eventTypeDistribution,
  }

  // 2. 패턴 분석
  const prompt: Level3 = totalPrompts > 50 ? 'high' : totalPrompts > 20 ? 'medium' : 'low'
  const interval: IntervalLevel = avgInterval < 5 ? 'short' : avgInterval < 30 ? 'medium' : 'long'
  const refinement = rateLevel(refinementLoops / Math.max(totalPrompts, 1))
  const decision = rateLevel(decisionBatches.length / Math.max(eventCount, 1))

  // 3. 행동 점수화
  const scores: Record<StyleName, number> = {
    'AI-Driven Executor': 0,
    'AI-Assisted Thinker': 0,
    'AI Checker': 0,
    'Balanced Collaborator': 0,
  }
  if (prompt === 'high') scores['AI-Driven Executor'] += 0.35
  if (interval === 'short') scores['AI-Driven Executor'] += 0.35
  if (refinement === 'low') scores['AI-Driven Executor'] += 0.2

  if (prompt === 'medium') scores['AI-Assisted Thinker'] += 0.25
  if (interval === 'long') scores['AI-Assisted Thinker'] += 0.35
  if (refinement === 'high') scores['AI-Assisted Thinker'] += 0.3

  if (prompt === 'low') scores['AI Checker'] += 0.4
  if (interval === 'long') scores['AI Checker'] += 0.3
  if (refinement === 'low') scores['AI Checker'] += 0.2

  if (prompt === 'medium') scores['Balanced Collaborator'] += 0.3
  if (interval === 'medium') scores['Balanced Collaborator'] += 0.3
  if (refinement === 'medium') scores['Balanced Collaborator'] += 0.25

  const total = STYLE_NAMES.reduce((sum, name) => sum + scores[name], 0)
  for (const name of STYLE_NAMES) {
    scores[name] = total > 0 ? round2(scores[name] / total) : 0.25
  }

  // 5. 스타일 결정: 점수가 가장 높은 스타일 (동점이면 앞 순서)
  let style: StyleName = STYLE_NAMES[0]
  for (const name of STYLE_NAMES) {
    if (scores[name] > scores[style]) style = name
  }

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

function batchLabel(batch: ObserveBatch, lang: Lang): string {
  const text = EVENT_LABEL_TEXT[lang]
  if (batch.refinement) return text.refinement
  if (batch.promptCount >= 3) {
    return batch.avgIntervalSec < 10 ? text.delegation : text.careful(batch.promptCount)
  }
  return text.interaction
}

function timelineEvents(analysis: Analysis, lang: Lang): TimelineEvent[] {
  return analysis.batches.map((batch) => {
    const start = new Date(batch.at)
    return {
      start: formatTime(start),
      end: formatTime(new Date(start.getTime() + 5 * 60_000)),
      label: batchLabel(batch, lang),
    }
  })
}

/** 대시보드용 결과 */
export function toResult(sessionId: string, analysis: Analysis, lang: Lang): SessionResultData {
  const info = STYLE_INFO[lang][analysis.style]
  const typeCode = toTypeCode(analysis.style)
  return {
    sessionId,
    primaryStyle: { typeCode, displayName: analysis.style, description: info.description },
    styleDetail: TYPE_CONTENTS[typeCode][lang],
    dataSummary: dataSummary(analysis),
    strengths: info.strengths,
    cautions: info.cautions,
    dailyTimeline: {
      decisionCount: analysis.batches.length,
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
  if (insights.length === 0) insights.push(text.balanced)
  return insights
}

/** LLM을 쓸 수 없을 때의 규칙 기반 인사이트 */
export function fallbackInsights(analysis: Analysis, lang: Lang): string[] {
  const text = FALLBACK_INSIGHT_TEXT[lang]
  const { totalPrompts, avgInterval } = analysis.metrics
  const insights: string[] = []
  if (totalPrompts > 30) insights.push(text.active)
  else if (totalPrompts < 10) insights.push(text.selective)
  if (avgInterval < 10) insights.push(text.quick)
  else if (avgInterval > 30) insights.push(text.careful)
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
