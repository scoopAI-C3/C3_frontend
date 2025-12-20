export type EventType =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'PROMPT_SUBMIT'
  | 'AI_RESPONSE_START'
  | 'AI_RESPONSE_END'

export type PlatformType = 'chat.openai.com' | 'claude.ai' | 'gemini.google.com'

export interface AgentEvent {
  type: EventType
  timestamp: number
  message: string
  platform: PlatformType
}

export type AgentStatusType = 'Observing' | 'Approaching Decision Boundary' | 'Intervention Triggered' | 'Inactive'
export type RiskType = 'High' | 'Medium' | 'Low'

export interface DisplayEvent {
  time: string
  message: string
}

export * from './session'
