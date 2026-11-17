/**
 * 리포트의 "LLM 상세 분석" 문장 요청.
 * 집계된 수치만 Vercel 함수(api/insights.ts)로 보내고, 실패하면 null을 돌려준다
 * (호출하는 쪽에서 규칙 기반 문장으로 대체).
 */
import type { Analysis } from './analyze'
import type { Lang } from './texts'

const INSIGHTS_URL: string = import.meta.env.VITE_INSIGHTS_URL || 'https://handofff.vercel.app/api/insights'
const TIMEOUT_MS = 10_000

export interface InsightsRequest {
  language: Lang
  metrics: {
    totalPrompts: number
    avgInterval: number
    refinementLoops: number
    decisionBoundaries: number
  }
  levels: Analysis['levels']
  scores: Analysis['relativeStyles']
}

export function buildInsightsRequest(analysis: Analysis, language: Lang): InsightsRequest {
  const { totalPrompts, avgInterval, refinementLoops, decisionBoundaries } = analysis.metrics
  return {
    language,
    metrics: { totalPrompts, avgInterval, refinementLoops, decisionBoundaries },
    levels: analysis.levels,
    scores: analysis.relativeStyles,
  }
}

export async function fetchLlmInsights(analysis: Analysis, language: Lang): Promise<string[] | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(INSIGHTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildInsightsRequest(analysis, language)),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as { insights?: unknown }
    if (!Array.isArray(data.insights)) return null
    const insights = data.insights.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    return insights.length > 0 ? insights.slice(0, 3) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}
