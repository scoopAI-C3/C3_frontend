import type { Intent } from '../local/intent'

export interface ApiResponse<T> {
  isSuccess: boolean
  code: string
  message: string
  result: T
}

export interface AICollaborationType {
  id: number
  typeCode: string
  displayName: string
  colorCode: string
  isActive: boolean
}

export interface AICollaborationTypeListResult {
  totalCount: number
  types: AICollaborationType[]
}

export interface AICollaborationTypeContent {
  id: number
  sectionKey: string
  content: string
  displayOrder: number
}

export interface AICollaborationTypeDetail extends AICollaborationType {
  contents: Record<string, string>
  contentList: AICollaborationTypeContent[]
}

export interface SessionStartResult {
  sessionId: string
  status: string
  startedAt: string
}

export interface AgentEventResult {
  type: string
  startTime: string
  endTime: string
  summary: string
}

export interface SessionObserveResult {
  status: string
  agentState: string
  agentEvent: AgentEventResult
}

export interface SessionAnalyzeResult {
  sessionId: string
  status: string
  message: string
}

export interface PrimaryStyle {
  typeCode: string
  displayName: string
  description: string
}

export interface StyleDetail {
  tagline: string
  summary: string
  todayMessage: string
  description: string
  catchphrase: string
  detailStrengths: string[]
  detailCautions: string[]
  tip: string
}

export interface DataSummary {
  aiUsageFrequency: string
  avgPromptInterval: string
  refinementRate: string
  decisionEventFrequency: string
}

export interface TimelineEvent {
  start: string
  end: string
  label: string
}

export interface DailyTimeline {
  decisionCount: number
  events: TimelineEvent[]
}

export interface SessionResultData {
  sessionId: string
  primaryStyle: PrimaryStyle
  styleDetail: StyleDetail
  dataSummary: DataSummary
  strengths: string[]
  cautions: string[]
  dailyTimeline: DailyTimeline
  roleDistribution: Record<string, number> | null
  relativeStyles: Record<string, number>
  aiToolUsage: Record<string, number>
}

export interface RecentCollaborationEvent {
  id: string
  sessionId: string
  type: string
  startTime: string
  endTime: string
  summary: string
}

export interface RecentSessionsResult {
  status: string
  events: RecentCollaborationEvent[]
}

export interface ObserveContext {
  domain: string
  sessionStartAt: string
  sessionEndAt: string
}

export interface InteractionMetrics {
  promptSubmitCount: number
  avgPromptIntervalSec: number
  refinementLoopDetected: boolean
}

export interface InteractionTimelineItem {
  type: string
  domain: string
  timestamp: string
  /** 상세 분석이 켜져 있을 때만 있음 (텍스트 없이 분류 결과와 길이만) */
  intent?: Intent
  length?: number
  responseLength?: number
}

export interface SessionObserveRequest {
  sessionId: string
  context: ObserveContext
  interactionMetrics: InteractionMetrics
  interactionTimeline: InteractionTimelineItem[]
}

export interface SessionAnalyzeRequest {
  sessionId: string
  language?: string
}

// Survey Result (설문 결과 API 응답)
export interface SurveyResultData {
  primaryStyle: PrimaryStyle
  styleDetail: StyleDetail
  dataSummary: DataSummary
  strengths: string[]
  cautions: string[]
}

// Graph API 타입 정의
export interface GraphExecution {
  nodesExecuted: string[]
  executionTime: number
  errors: string[]
}

export interface GraphMetrics {
  totalPrompts: number
  avgInterval: number
  refinementLoops: number
  decisionBoundaries: number
  avgPromptLength: number
  eventCount: number
  eventTypeDistribution: Record<string, number>
}

export interface PatternDetail {
  level: string
  score: number
  description: string
}

export interface GraphPatterns {
  prompt: PatternDetail
  interval: PatternDetail
  refinement: PatternDetail
}

/** 상세 분석 결과 (상세 분석으로 기록된 질문이 있을 때만) */
export interface DetailSummary {
  prompts: number
  intents: Record<Intent, number>
  avgPromptLength: number
  /** 긴 답변(1,500자 이상)을 5초 안에 넘기고 다음 질문을 보낸 횟수 */
  skimmedAnswers: number
  longAnswers: number
}

export interface SessionGraphData {
  detail?: DetailSummary
  sessionId: string
  graphExecution: GraphExecution
  metrics: GraphMetrics
  patterns: GraphPatterns
  llmInsights: string[]
  patternInsights: string[]
}
