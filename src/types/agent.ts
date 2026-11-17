import type { Intent } from '../local/intent'

export type EventType =
  | 'SESSION_START'
  | 'SESSION_END'
  | 'PROMPT_SUBMIT'
  | 'AI_RESPONSE_START'
  | 'AI_RESPONSE_END'

export type PlatformType = 'chat.openai.com' | 'claude.ai' | 'gemini.google.com'

/** 상세 분석이 켜져 있을 때만 붙는 정보. 텍스트는 들어가지 않는다. */
export interface EventDetail {
  intent?: Intent
  /** 질문 글자 수 */
  length?: number
  /** AI 답변 글자 수 */
  responseLength?: number
}

export interface AgentEvent {
  type: EventType
  timestamp: number
  message: string
  platform: PlatformType
  detail?: EventDetail
}

export type AgentStatusType = 'Observing' | 'Approaching Decision Boundary' | 'Intervention Triggered' | 'Inactive'
export type RiskType = 'High' | 'Medium' | 'Low'

export interface DisplayEvent {
  time: string
  message: string
}

export * from './session'
