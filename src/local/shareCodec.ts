/**
 * 공유 링크 인코딩.
 * 서버에 저장하지 않고, 분석 결과 자체를 압축해서 링크(URL)에 담는다.
 * 링크를 받은 사람의 브라우저가 그 내용을 풀어서 화면에 보여 준다.
 */
import type { Analysis } from './analyze'
import type { Lang } from './texts'

export interface SharePayload {
  v: 1
  sessionId: string
  createdAt: string
  /** 만료 시각(ms). 지나면 링크를 열 수 없다. */
  exp: number | null
  analysis: Analysis
  llmInsights?: Partial<Record<Lang, string[]>>
}

/** 링크가 지나치게 길어지지 않도록 타임라인 구간은 최근 것만 담는다 */
export const MAX_SHARED_BATCHES = 40

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(token: string): Uint8Array {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  return new Uint8Array(await new Response(output).arrayBuffer())
}

export async function encodeShare(payload: SharePayload): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(payload))
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')))
}

/** 형식이 잘못됐거나 만료된 링크면 null */
export async function decodeShare(token: string): Promise<SharePayload | null> {
  try {
    const json = await pipe(fromBase64Url(token), new DecompressionStream('deflate-raw'))
    const payload = JSON.parse(new TextDecoder().decode(json)) as SharePayload
    if (payload?.v !== 1 || typeof payload.sessionId !== 'string' || !payload.analysis?.style) return null
    if (payload.exp !== null && Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}
