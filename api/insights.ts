/**
 * Vercel 함수: 리포트의 "LLM 상세 분석" 문장 3개를 생성한다.
 *
 * - 입력은 집계된 수치와 등급뿐이다. 자유 텍스트를 받지 않으므로 임의 프롬프트를 실행시키는 용도로 쓸 수 없다.
 * - 아무것도 저장하지 않는다. OpenAI 키는 Vercel 환경 변수(OPENAI_API_KEY)에만 둔다.
 * - 실패하면 확장 프로그램이 규칙 기반 문장으로 대체하므로, 이 함수가 죽어도 서비스는 동작한다.
 *
 * 환경 변수
 *   OPENAI_API_KEY   (필수)
 *   OPENAI_MODEL     (선택, 기본 gpt-6-luna)
 *   OPENAI_BASE_URL  (선택, 기본 https://api.openai.com/v1)
 *   ALLOWED_ORIGINS  (선택, 쉼표 구분. 지정하면 그 오리진만 허용. 예: chrome-extension://<확장 ID>,https://handofff.vercel.app)
 */
import type { IncomingMessage, ServerResponse } from 'node:http'

type Lang = 'ko' | 'en'
const LEVEL3 = ['high', 'medium', 'low'] as const
const INTERVAL_LEVELS = ['short', 'medium', 'long'] as const
const STYLES = ['AI-Driven Executor', 'AI-Assisted Thinker', 'AI Checker', 'Balanced Collaborator'] as const
const INTENTS = ['execute', 'opinion', 'verify', 'revise', 'info', 'other'] as const
const INTENT_TEXT: Record<(typeof INTENTS)[number], string> = {
  execute: '실행 요청', opinion: '의견·사고', verify: '검증 요청', revise: '수정 요청', info: '정보 질문', other: '기타',
}

interface InsightsInput {
  language: Lang
  metrics: { totalPrompts: number; avgInterval: number; refinementLoops: number; decisionBoundaries: number }
  levels: {
    prompt: (typeof LEVEL3)[number]
    interval: (typeof INTERVAL_LEVELS)[number]
    refinement: (typeof LEVEL3)[number]
  }
  scores: Record<(typeof STYLES)[number], number>
  /** 상세 분석을 켠 사용자만: 요청 유형별 개수 */
  intents?: Record<(typeof INTENTS)[number], number>
}

export interface HandlerRequest {
  method: string
  origin?: string
  /** 이 함수가 서비스되는 호스트 (같은 사이트에서 온 요청을 허용하는 데 쓴다) */
  host?: string
  ip: string
  body: unknown
}

export interface HandlerResponse {
  status: number
  headers: Record<string, string>
  body?: unknown
}

export interface HandlerEnv {
  OPENAI_API_KEY?: string
  OPENAI_MODEL?: string
  OPENAI_BASE_URL?: string
  ALLOWED_ORIGINS?: string
}

// ── 오리진 검사 ──────────────────────────────────────────────

function isAllowedOrigin(origin: string | undefined, host: string | undefined, env: HandlerEnv): boolean {
  if (!origin) return false
  const configured = (env.ALLOWED_ORIGINS ?? '').split(',').map((item) => item.trim()).filter(Boolean)
  if (configured.length > 0) return configured.includes(origin)
  // 기본값: 확장 프로그램 오리진과, 이 함수와 같은 사이트(웹 배포본). 출시 후에는 ALLOWED_ORIGINS로 좁히는 것을 권장.
  return origin.startsWith('chrome-extension://') || (!!host && (origin === `https://${host}` || origin === `http://${host}`))
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

// ── 호출 제한 (IP당 분당 10회) ───────────────────────────────
// 함수 인스턴스 메모리에만 있으므로 완벽하지 않다. 강한 제한이 필요하면 Vercel Firewall 규칙을 함께 쓴다.

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

function isRateLimited(ip: string, now: number): boolean {
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

// ── 입력 검증 ────────────────────────────────────────────────

function isCount(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max
}

function parseInput(body: unknown): InsightsInput | null {
  if (!body || typeof body !== 'object') return null
  const { language, metrics, levels, scores, intents } = body as Record<string, unknown>
  if (language !== 'ko' && language !== 'en') return null

  const m = metrics as Record<string, unknown> | undefined
  if (!m || !isCount(m.totalPrompts, 100_000) || !isCount(m.avgInterval, 10_000_000) || !isCount(m.refinementLoops, 100_000) || !isCount(m.decisionBoundaries, 100_000)) {
    return null
  }

  const l = levels as Record<string, unknown> | undefined
  if (!l || !LEVEL3.includes(l.prompt as never) || !INTERVAL_LEVELS.includes(l.interval as never) || !LEVEL3.includes(l.refinement as never)) {
    return null
  }

  const s = scores as Record<string, unknown> | undefined
  if (!s || !STYLES.every((style) => isCount(s[style], 1))) return null

  let parsedIntents: InsightsInput['intents']
  if (intents !== undefined) {
    const i = intents as Record<string, unknown> | null
    if (!i || typeof i !== 'object' || !INTENTS.every((intent) => isCount(i[intent] ?? 0, 100_000))) return null
    parsedIntents = Object.fromEntries(INTENTS.map((intent) => [intent, Math.round(Number(i[intent] ?? 0))])) as InsightsInput['intents']
  }

  return {
    language,
    metrics: {
      totalPrompts: Math.round(m.totalPrompts),
      avgInterval: Math.round(m.avgInterval * 100) / 100,
      refinementLoops: Math.round(m.refinementLoops),
      decisionBoundaries: Math.round(m.decisionBoundaries),
    },
    levels: { prompt: l.prompt, interval: l.interval, refinement: l.refinement } as InsightsInput['levels'],
    scores: Object.fromEntries(STYLES.map((style) => [style, s[style]])) as InsightsInput['scores'],
    ...(parsedIntents ? { intents: parsedIntents } : {}),
  }
}

// ── 프롬프트 ─────────────────────────────────────────────────

const PATTERN_TEXT = {
  prompt: { high: '매우 적극적인 AI 활용', medium: '적절한 AI 활용', low: '선택적 AI 활용' },
  interval: { short: '빠른 연속 상호작용', medium: '적당한 사고 시간', long: '충분한 사고 후 상호작용' },
  refinement: { high: '적극적인 반복 수정', medium: '적당한 수정 과정', low: '수정 없이 수용' },
}

function buildPrompt(input: InsightsInput): string {
  const { metrics, levels, scores } = input
  const scoreLines = STYLES.map((style) => `- ${style}: ${scores[style]}`).join('\n')
  const intentLines = input.intents
    ? `\n\n요청 유형 (사용자가 동의한 상세 분석, 개수):\n${INTENTS.map((intent) => `- ${INTENT_TEXT[intent]}: ${input.intents?.[intent] ?? 0}`).join('\n')}`
    : ''
  const languageRule = input.language === 'en'
    ? 'Write the three insights in English.'
    : '인사이트 3개는 한국어로 작성해주세요.'

  return `다음 AI 협업 데이터를 분석해주세요:

메트릭:
- 총 프롬프트 수: ${metrics.totalPrompts}
- 평균 프롬프트 간격: ${metrics.avgInterval}초
- 수정 반복 횟수: ${metrics.refinementLoops}
- 의사결정 경계: ${metrics.decisionBoundaries}

패턴 분석:
- 프롬프트 패턴: ${PATTERN_TEXT.prompt[levels.prompt]}
- 인터벌 패턴: ${PATTERN_TEXT.interval[levels.interval]}
- 수정 패턴: ${PATTERN_TEXT.refinement[levels.refinement]}

행동 점수:
${scoreLines}${intentLines}

사용자에게 직접 말하듯 각 인사이트를 한 문장으로 써주세요. ${languageRule}
3가지 핵심 인사이트를 JSON 형식으로 제공해주세요:
{"insights": ["인사이트1", "인사이트2", "인사이트3"]}`
}

function extractInsights(text: string): string[] {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return []
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as { insights?: unknown }
    if (!Array.isArray(parsed.insights)) return []
    return parsed.insights
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 3)
  } catch {
    return []
  }
}

// ── 모델 설정 ────────────────────────────────────────────────

/** gpt-4o-mini는 2027-01-14에 API에서 종료되고, OpenAI가 안내한 대체 모델이 gpt-6-luna다. */
const DEFAULT_MODEL = 'gpt-6-luna'

/**
 * 추론 모델은 temperature 0.7과 max_tokens를 거절할 수 있고, 추론에 출력 한도를 다 쓰면 빈 답이 온다.
 * 그래서 추론 없이 바로 답하게 한다. 추론 설정이 없는 gpt-3·4 계열에는 예전 값을 쓴다.
 */
function generationParams(model: string): Record<string, unknown> {
  if (/^gpt-[34]/.test(model)) return { temperature: 0.7, max_tokens: 400 }
  return { reasoning_effort: 'none', max_completion_tokens: 400 }
}

// ── 핸들러 본체 (테스트할 수 있도록 순수 함수로 분리) ────────

export async function handleInsights(
  request: HandlerRequest,
  env: HandlerEnv,
  fetchImpl: typeof fetch = fetch,
  now: number = Date.now(),
): Promise<HandlerResponse> {
  if (!isAllowedOrigin(request.origin, request.host, env)) {
    return { status: 403, headers: {}, body: { error: 'origin_not_allowed' } }
  }
  const headers = corsHeaders(request.origin as string)

  if (request.method === 'OPTIONS') return { status: 204, headers }
  if (request.method !== 'POST') return { status: 405, headers, body: { error: 'method_not_allowed' } }

  const input = parseInput(request.body)
  if (!input) return { status: 400, headers, body: { error: 'invalid_request' } }

  if (isRateLimited(request.ip, now)) {
    return { status: 429, headers: { ...headers, 'Retry-After': '60' }, body: { error: 'rate_limited' } }
  }

  if (!env.OPENAI_API_KEY) return { status: 503, headers, body: { error: 'not_configured' } }

  try {
    const baseUrl = (env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
    const model = env.OPENAI_MODEL || DEFAULT_MODEL
    const response = await fetchImpl(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model,
        ...generationParams(model),
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: buildPrompt(input) }],
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return { status: 502, headers, body: { error: 'llm_error' } }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
    const insights = extractInsights(data.choices?.[0]?.message?.content ?? '')
    if (insights.length === 0) return { status: 502, headers, body: { error: 'llm_empty' } }

    return { status: 200, headers: { ...headers, 'Cache-Control': 'no-store' }, body: { insights } }
  } catch {
    return { status: 502, headers, body: { error: 'llm_unreachable' } }
  }
}

// ── Vercel(Node) 진입점 ──────────────────────────────────────

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body) } catch { return null }
    }
    return req.body
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > 10_000) return null
    chunks.push(chunk as Buffer)
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { return null }
}

function clientIp(req: IncomingMessage): string {
  // Vercel이 실제 접속 IP를 x-real-ip / x-forwarded-for 에 넣어 준다
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp) return realIp
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse): Promise<void> {
  const method = req.method ?? 'GET'
  const result = await handleInsights(
    {
      method,
      origin: typeof req.headers.origin === 'string' ? req.headers.origin : undefined,
      host: req.headers.host,
      ip: clientIp(req),
      body: method === 'POST' ? await readBody(req) : null,
    },
    process.env as HandlerEnv,
  )
  for (const [name, value] of Object.entries(result.headers)) res.setHeader(name, value)
  res.statusCode = result.status
  if (result.body === undefined) {
    res.end()
    return
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(result.body))
}
