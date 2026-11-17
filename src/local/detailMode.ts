/**
 * 상세 분석 모드 상태 (사용자 동의와 범위).
 * chrome.storage.local 의 DETAIL_MODE_KEY 에 저장된다. 없으면 꺼진 상태.
 */

export const DETAIL_MODE_KEY = 'detailMode'
/** 동의 문구가 바뀌면 올려서 다시 동의를 받는다 */
export const CONSENT_VERSION = 1

export type DetailScope = 'conversation' | '30m' | '1h' | 'today'

export interface DetailMode {
  consentVersion: number
  consentedAt: number
  scope: DetailScope
  /** 이 시각(ms)이 지나면 자동으로 꺼진다 */
  until: number
  /** scope === 'conversation' 일 때 대상 대화 */
  conversation?: {
    host: string
    /** 새 대화 화면에서 켠 경우 null: 첫 질문을 보낸 뒤 생기는 대화 주소로 정해진다 */
    path: string | null
  }
}

/** 대화가 아닌 시작 화면 주소 (여기서 켜면 첫 질문 후 생기는 대화에 묶는다) */
const HOME_PATHS = new Set(['/', '/new', '/app', '/chat', '/chats'])

export function isHomePath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  return HOME_PATHS.has(path)
}

/** 대화를 구분하는 주소 (쿼리·해시 제외) */
export function conversationPath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/'
}

export function scopeUntil(scope: DetailScope, now: number = Date.now()): number {
  switch (scope) {
    case '30m':
      return now + 30 * 60_000
    case '1h':
      return now + 60 * 60_000
    case 'today': {
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      return end.getTime()
    }
    case 'conversation':
      // 대화 단위라도 하루가 지나면 자동으로 끈다
      return now + 24 * 60 * 60_000
  }
}

export function isExpired(mode: DetailMode, now: number = Date.now()): boolean {
  return mode.consentVersion !== CONSENT_VERSION || now >= mode.until
}

export function remainingText(mode: DetailMode, lang: 'ko' | 'en', now: number = Date.now()): string {
  if (mode.scope === 'conversation') return lang === 'ko' ? '이 대화만' : 'This conversation only'
  const minutes = Math.max(0, Math.ceil((mode.until - now) / 60_000))
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return lang === 'ko' ? `${hours}시간 ${rest}분 남음` : `${hours}h ${rest}m left`
  }
  return lang === 'ko' ? `${minutes}분 남음` : `${minutes} min left`
}
