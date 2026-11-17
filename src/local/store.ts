/**
 * 세션 기록 저장소.
 * 확장 프로그램에서는 chrome.storage.local, 웹(공유 링크를 여는 쪽)에서는 localStorage를 쓴다.
 * 서버로는 아무것도 보내지 않는다.
 */
import type { InteractionTimelineItem } from '../types/session'
import type { Analysis, ObserveBatch } from './analyze'
import type { Lang } from './texts'

export interface SessionRecord {
  sessionId: string
  startedAt: string
  /** 가장 최근 observe 시점의 누적 타임라인 */
  timeline: InteractionTimelineItem[]
  /** observe 시점마다 남긴 요약 */
  batches: ObserveBatch[]
  /** 분석을 실행한 시점의 결과 (언어 무관) */
  analysis?: Analysis
  analyzedAt?: string
  /** LLM이 생성한 인사이트 (요청한 언어별) */
  llmInsights?: Partial<Record<Lang, string[]>>
}

const PREFIX = 'session:'
const MAX_RECORDS = 20
const MAX_BATCHES = 200

function hasExtensionStorage(): boolean {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local
}

export async function loadRecord(sessionId: string): Promise<SessionRecord | null> {
  const key = PREFIX + sessionId
  if (hasExtensionStorage()) {
    const data = (await chrome.storage.local.get(key)) as Record<string, SessionRecord | undefined>
    return data[key] ?? null
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as SessionRecord) : null
  } catch {
    return null
  }
}

export async function saveRecord(record: SessionRecord): Promise<void> {
  const key = PREFIX + record.sessionId
  const trimmed: SessionRecord = { ...record, batches: record.batches.slice(-MAX_BATCHES) }
  if (hasExtensionStorage()) {
    await chrome.storage.local.set({ [key]: trimmed })
    await pruneExtensionRecords()
    return
  }
  localStorage.setItem(key, JSON.stringify(trimmed))
  pruneWebRecords()
}

/** 오래된 세션 기록부터 지워 MAX_RECORDS개만 남긴다 */
async function pruneExtensionRecords(): Promise<void> {
  const all = (await chrome.storage.local.get(null)) as Record<string, unknown>
  const records = Object.entries(all)
    .filter(([key]) => key.startsWith(PREFIX))
    .map(([key, value]) => ({ key, startedAt: (value as SessionRecord).startedAt ?? '' }))
  if (records.length <= MAX_RECORDS) return
  records.sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  await chrome.storage.local.remove(records.slice(0, records.length - MAX_RECORDS).map((r) => r.key))
}

function pruneWebRecords(): void {
  const records: { key: string; startedAt: string }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(PREFIX)) continue
    try {
      records.push({ key, startedAt: (JSON.parse(localStorage.getItem(key) ?? '{}') as SessionRecord).startedAt ?? '' })
    } catch {
      records.push({ key, startedAt: '' })
    }
  }
  if (records.length <= MAX_RECORDS) return
  records.sort((a, b) => a.startedAt.localeCompare(b.startedAt))
  for (const record of records.slice(0, records.length - MAX_RECORDS)) {
    localStorage.removeItem(record.key)
  }
}

export function newSessionId(): string {
  return 'session-' + crypto.randomUUID().slice(0, 8)
}
