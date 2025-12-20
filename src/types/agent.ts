export interface AgentEvent {
  type: 'session_start' | 'session_end' | 'user_message' | 'ai_response_start' | 'ai_response_end'
  timestamp: number
  message: string
  platform: 'chatgpt' | 'claude' | 'gemini'
}

export type AgentStatusType = 'Observing' | 'Approaching Decision Boundary' | 'Intervention Triggered' | 'Inactive'
export type RiskType = 'High' | 'Medium' | 'Low'
export type PlatformType = 'chatgpt' | 'claude' | 'gemini'

export interface DisplayEvent {
  time: string
  message: string
}

export * from './session'
