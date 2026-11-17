/**
 * 공유 API.
 * 서버에 저장하지 않고 분석 결과를 링크 자체에 담는다 (src/local/shareCodec.ts).
 */
import type { ApiResponse } from '../types/agent'
import type { CreateShareLinkRequest, ShareLinkInfo, SharedSessionResult } from '../types/share'
import { toResult } from '../local/analyze'
import { decodeShare, encodeShare, MAX_SHARED_BATCHES } from '../local/shareCodec'
import { loadRecord, saveRecord } from '../local/store'
import { toLang } from '../local/texts'

/** 공유 링크가 열리는 웹 주소 */
const WEB_URL: string = (import.meta.env.VITE_WEB_URL || 'https://handofff.vercel.app').replace(/\/$/, '')

function fail<T>(code: string, message: string): ApiResponse<T> {
  return { isSuccess: false, code, message, result: null as T }
}

export const createShareLink = async (request: CreateShareLinkRequest): Promise<ApiResponse<ShareLinkInfo>> => {
  const record = await loadRecord(request.sessionId)
  if (!record?.analysis) return fail('SESSION400', 'Session not analyzed')

  const createdAt = new Date()
  const exp = request.expiresInHours > 0 ? createdAt.getTime() + request.expiresInHours * 3_600_000 : null
  const shareToken = await encodeShare({
    v: 1,
    sessionId: record.sessionId,
    createdAt: createdAt.toISOString(),
    exp,
    analysis: { ...record.analysis, batches: record.analysis.batches.slice(-MAX_SHARED_BATCHES) },
    llmInsights: record.llmInsights,
  })

  return {
    isSuccess: true,
    code: 'COMMON200',
    message: 'OK',
    result: {
      shareToken,
      shareUrl: `${WEB_URL}/#/share/${shareToken}`,
      sessionId: record.sessionId,
      expiresAt: exp ? new Date(exp).toISOString() : '',
      isActive: true,
      viewCount: 0,
      createdAt: createdAt.toISOString(),
    },
  }
}

export const getSharedSessionResult = async (shareToken: string, language?: string): Promise<ApiResponse<SharedSessionResult>> => {
  const payload = await decodeShare(shareToken)
  if (!payload) return fail('SHARE404', 'Invalid or expired share link')

  // 공유받은 결과를 이 브라우저에 저장해 두면 대시보드와 리포트 화면이 같은 방식으로 읽을 수 있다
  await saveRecord({
    sessionId: payload.sessionId,
    startedAt: payload.createdAt,
    timeline: [],
    batches: [],
    analysis: payload.analysis,
    analyzedAt: payload.createdAt,
    llmInsights: payload.llmInsights,
  })

  return {
    isSuccess: true,
    code: 'COMMON200',
    message: 'OK',
    result: {
      shareInfo: { shareToken, sharedAt: payload.createdAt, viewCount: 0 },
      result: toResult(payload.sessionId, payload.analysis, toLang(language)),
    },
  }
}
