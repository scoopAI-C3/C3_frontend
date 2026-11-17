/**
 * 상세 분석: 질문 텍스트를 요청 유형으로 분류한다.
 *
 * - content script 안에서 바로 실행되고, 텍스트는 분류에만 쓰인 뒤 버려진다.
 *   저장되거나 밖으로 나가는 것은 유형 이름과 글자 수뿐이다.
 * - 표현 목록 기반이라 애매한 문장은 틀릴 수 있다. 여러 유형에 걸리면 아래 순서로 정한다.
 *   수정 → 검증 → 의견 → 정보 → 실행  ("다시 설명해줘"는 수정, "맞는지 확인해줘"는 검증)
 */

export const INTENTS = ['execute', 'opinion', 'verify', 'revise', 'info'] as const
export type Intent = (typeof INTENTS)[number] | 'other'

const RULES: { intent: Exclude<Intent, 'other'>; pattern: RegExp }[] = [
  {
    intent: 'revise',
    pattern:
      /(다시|고쳐|수정해|바꿔|그게\s*아니|아니\s*그|틀렸|잘못됐|말고|대신|더\s*(짧|길|간단|자세|쉽)|줄여|늘려|다른\s*걸로)|\b(again|redo|retry|rewrite|instead|not what i|that'?s wrong|you'?re wrong|shorter|longer|simpler|fix (it|this|that))\b/i,
  },
  {
    intent: 'verify',
    pattern:
      /(확인해|검토해|검증|체크해|리뷰해|맞(아|나|는지|니|지\?)|틀린\s*(곳|부분|거|데)|오류\s*(있|찾)|문제\s*(있|없)|괜찮(아|은지|나)|이상한\s*(곳|부분|거))|\b(check|verify|review|proofread|double[- ]check|is (this|it|that) (correct|right|ok)|any (errors?|bugs?|mistakes?)|does this look)\b/i,
  },
  {
    intent: 'opinion',
    pattern:
      /(어떻게\s*생각|의견|장단점|추천해|어느\s*(게|것|쪽)|뭐가\s*(나아|좋|더)|비교해|다른\s*(방법|관점|아이디어)|고민|조언|아이디어|브레인스토밍)|\b(what do you think|your (opinion|thoughts|take)|pros and cons|should i|which (one|is better|would)|recommend|compare|alternatives?|ideas?|advice|trade-?offs?|brainstorm)\b/i,
  },
  {
    intent: 'info',
    pattern:
      /(뭐야|무엇|무슨|설명해|알려\s*줘|이란|란\s*\??$|차이(가|는|점)|왜\s|왜$|어떻게\s*(하는|되는|작동|동작)|뜻이|의미가)|\b(what is|what are|what'?s|explain|how does|how do|why|meaning of|definition|tell me about|difference between)\b/i,
  },
  {
    intent: 'execute',
    pattern:
      /(해\s*줘|해줘|해\s*주세요|만들어|작성해|써\s*줘|짜\s*줘|구현해|변환해|번역해|요약해|정리해|생성해|추가해|그려\s*줘|뽑아\s*줘)|\b(write|create|make|generate|build|implement|translate|summari[sz]e|convert|draft|refactor)\b/i,
  },
]

export function classifyIntent(text: string): Intent {
  const sample = text.trim().slice(0, 2000)
  if (!sample) return 'other'
  for (const rule of RULES) {
    if (rule.pattern.test(sample)) return rule.intent
  }
  return 'other'
}

/** 각 요청 유형이 어느 스타일 쪽을 가리키는지 (합이 1) */
export const INTENT_STYLE_WEIGHTS: Record<Exclude<Intent, 'other'>, Partial<Record<string, number>>> = {
  execute: { 'AI-Driven Executor': 1 },
  opinion: { 'AI-Assisted Thinker': 1 },
  verify: { 'AI Checker': 1 },
  revise: { 'AI-Assisted Thinker': 0.5, 'AI-Driven Executor': 0.5 },
  info: { 'Balanced Collaborator': 0.6, 'AI Checker': 0.4 },
}

export const INTENT_LABELS: Record<'ko' | 'en', Record<Intent, string>> = {
  ko: { execute: '실행 요청', opinion: '의견·사고', verify: '검증 요청', revise: '수정 요청', info: '정보 질문', other: '기타' },
  en: { execute: 'Do it for me', opinion: 'Opinion / thinking', verify: 'Check / verify', revise: 'Revise', info: 'Ask for info', other: 'Other' },
}
