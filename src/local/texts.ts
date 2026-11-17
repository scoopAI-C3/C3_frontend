/**
 * 분석 결과에 쓰이는 고정 문구 (한/영).
 * 예전 백엔드(spoon-service/graph/state.py, collaboration_graph.py, ResultResponseDto.java)에서 옮겨 왔다.
 */

export type Lang = 'ko' | 'en'

export const STYLE_NAMES = [
  'AI-Driven Executor',
  'AI-Assisted Thinker',
  'AI Checker',
  'Balanced Collaborator',
] as const
export type StyleName = (typeof STYLE_NAMES)[number]

export type TypeCode =
  | 'AI_DRIVEN_EXECUTOR'
  | 'AI_ASSISTED_THINKER'
  | 'AI_CHECKER'
  | 'BALANCED_COLLABORATOR'

export type Level3 = 'high' | 'medium' | 'low'
export type IntervalLevel = 'short' | 'medium' | 'long'

export function toLang(language?: string): Lang {
  return language?.toLowerCase() === 'en' ? 'en' : 'ko'
}

export function toTypeCode(style: StyleName): TypeCode {
  return style.toUpperCase().replace(/-/g, '_').replace(/ /g, '_') as TypeCode
}

export function styleFromTypeCode(typeCode: string): StyleName | null {
  return STYLE_NAMES.find((s) => toTypeCode(s) === typeCode) ?? null
}

interface StyleInfo {
  description: string
  strengths: string[]
  cautions: string[]
}

export const STYLE_INFO: Record<Lang, Record<StyleName, StyleInfo>> = {
  ko: {
    'AI-Driven Executor': {
      description: 'AI에 크게 의존하며 빠른 결정을 내리는 스타일입니다.',
      strengths: ['해커톤 / 프로토타이핑', '빠른 아이디어 검증'],
      cautions: ['중요한 의사결정', '장기 전략 수립'],
    },
    'AI-Assisted Thinker': {
      description: 'AI를 참고하되 신중하게 판단하는 스타일입니다.',
      strengths: ['깊이 있는 분석', '신중한 의사결정'],
      cautions: ['빠른 결정 필요 시', '단순 반복 작업'],
    },
    'AI Checker': {
      description: 'AI를 검증 도구로 활용하는 스타일입니다.',
      strengths: ['정확성 검증', '품질 관리'],
      cautions: ['창의적 작업', '새로운 아이디어 탐색'],
    },
    'Balanced Collaborator': {
      description: 'AI와 균형 있게 협업하는 스타일입니다.',
      strengths: ['균형 잡힌 협업', '상황별 유연한 대응'],
      cautions: ['극단적 시간 압박', '매우 단순한 작업'],
    },
  },
  en: {
    'AI-Driven Executor': {
      description: 'A style that heavily relies on AI and makes quick decisions.',
      strengths: ['Hackathons / Prototyping', 'Quick idea validation'],
      cautions: ['Important decision-making', 'Long-term strategy planning'],
    },
    'AI-Assisted Thinker': {
      description: 'A style that references AI but makes careful judgments.',
      strengths: ['In-depth analysis', 'Careful decision-making'],
      cautions: ['When quick decisions are needed', 'Simple repetitive tasks'],
    },
    'AI Checker': {
      description: 'A style that uses AI as a verification tool.',
      strengths: ['Accuracy verification', 'Quality management'],
      cautions: ['Creative work', 'Exploring new ideas'],
    },
    'Balanced Collaborator': {
      description: 'A style that collaborates with AI in a balanced manner.',
      strengths: ['Balanced collaboration', 'Flexible response to situations'],
      cautions: ['Extreme time pressure', 'Very simple tasks'],
    },
  },
}

export const PROMPT_PATTERN_TEXT: Record<Lang, Record<Level3, string>> = {
  ko: { high: '매우 적극적인 AI 활용', medium: '적절한 AI 활용', low: '선택적 AI 활용' },
  en: { high: 'Very active AI utilization', medium: 'Appropriate AI utilization', low: 'Selective AI utilization' },
}

export const INTERVAL_PATTERN_TEXT: Record<Lang, Record<IntervalLevel, string>> = {
  ko: { short: '빠른 연속 상호작용', medium: '적당한 사고 시간', long: '충분한 사고 후 상호작용' },
  en: { short: 'Rapid consecutive interactions', medium: 'Moderate thinking time', long: 'Interaction after sufficient thinking' },
}

export const REFINEMENT_PATTERN_TEXT: Record<Lang, Record<Level3, string>> = {
  ko: { high: '적극적인 반복 수정', medium: '적당한 수정 과정', low: '수정 없이 수용' },
  en: { high: 'Active iterative refinement', medium: 'Moderate refinement process', low: 'Acceptance without modification' },
}

export const PATTERN_INSIGHT_TEXT = {
  ko: {
    promptHigh: '높은 AI 활용 빈도: 적극적인 AI 의존 패턴',
    promptLow: '낮은 AI 활용 빈도: 선택적 AI 활용 패턴',
    intervalShort: '빠른 상호작용: 실행 중심의 빠른 의사결정',
    intervalLong: '신중한 상호작용: 깊은 사고 후 AI 활용',
    refinementHigh: '반복적 수정: AI와의 협력적 사고 과정',
    balanced: '균형 잡힌 상호작용 패턴을 보이고 있습니다.',
    topIntent: {
      execute: (pct: number) => `요청의 ${pct}%가 실행 요청: 결과물을 AI에게 맡기는 편`,
      opinion: (pct: number) => `요청의 ${pct}%가 의견·사고: AI를 생각의 상대로 쓰는 편`,
      verify: (pct: number) => `요청의 ${pct}%가 검증 요청: 내 판단을 AI로 확인하는 편`,
      revise: (pct: number) => `요청의 ${pct}%가 수정 요청: 결과를 계속 다듬어 가는 편`,
      info: (pct: number) => `요청의 ${pct}%가 정보 질문: AI를 검색처럼 쓰는 편`,
    },
    skimmed: (skimmed: number, total: number) => `긴 답변 ${total}개 중 ${skimmed}개는 5초 안에 다음 질문으로 넘어감`,
  },
  en: {
    promptHigh: 'High AI usage frequency: Active AI dependency pattern',
    promptLow: 'Low AI usage frequency: Selective AI utilization pattern',
    intervalShort: 'Rapid interaction: Execution-focused quick decision-making',
    intervalLong: 'Careful interaction: AI utilization after deep thinking',
    refinementHigh: 'Iterative refinement: Collaborative thinking process with AI',
    balanced: 'Showing a balanced interaction pattern.',
    topIntent: {
      execute: (pct: number) => `${pct}% of requests ask AI to do it: you hand over the output`,
      opinion: (pct: number) => `${pct}% of requests ask for opinions: you use AI as a thinking partner`,
      verify: (pct: number) => `${pct}% of requests ask to check: you verify your own judgment with AI`,
      revise: (pct: number) => `${pct}% of requests ask for revisions: you keep refining the result`,
      info: (pct: number) => `${pct}% of requests ask for information: you use AI like search`,
    },
    skimmed: (skimmed: number, total: number) => `Moved on within 5 seconds after ${skimmed} of ${total} long answers`,
  },
}

/** LLM을 쓸 수 없을 때 대신 보여 주는 규칙 기반 인사이트 */
export const FALLBACK_INSIGHT_TEXT = {
  ko: {
    active: '활발한 AI 활용으로 업무 효율성을 높이고 있습니다.',
    selective: 'AI를 선택적으로 활용하여 주체적인 판단을 유지하고 있습니다.',
    quick: '빠른 의사결정 사이클을 통해 실행력을 높이고 있습니다.',
    careful: '충분한 사고 시간을 갖고 신중하게 AI를 활용하고 있습니다.',
    balanced: '균형 잡힌 AI 협업 패턴을 보이고 있습니다.',
  },
  en: {
    active: 'Active AI utilization is improving work efficiency.',
    selective: 'Selectively using AI to maintain independent judgment.',
    quick: 'Quick decision cycles are enhancing execution capability.',
    careful: 'Taking sufficient thinking time to carefully utilize AI.',
    balanced: 'Showing a balanced AI collaboration pattern.',
  },
} satisfies Record<Lang, Record<string, string>>

export const EVENT_LABEL_TEXT = {
  ko: {
    refinement: '수정·재질문 반복 → 사고 보조 중심',
    delegation: '연속 질문 후 실행 위임',
    careful: (count: number) => `연속 질문 ${count}회 → 신중한 판단`,
    interaction: 'AI와 상호작용',
  },
  en: {
    refinement: 'Refinement loop → Thinking assistance',
    delegation: 'Consecutive questions → Execution delegation',
    careful: (count: number) => `Consecutive ${count} questions → Careful judgment`,
    interaction: 'AI interaction',
  },
}
