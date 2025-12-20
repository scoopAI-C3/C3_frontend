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
  dataSummary: DataSummary
  strengths: string[]
  cautions: string[]
  dailyTimeline: DailyTimeline
  roleDistribution: Record<string, number>
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
}

export interface SessionObserveRequest {
  sessionId: string
  context: ObserveContext
  interactionMetrics: InteractionMetrics
  interactionTimeline: InteractionTimelineItem[]
}

export interface SessionAnalyzeRequest {
  sessionId: string
}
