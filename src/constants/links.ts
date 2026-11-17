const GITHUB_URL = 'https://github.com/scoopAI-C3/C3_frontend'

/** 확장 프로그램 설치 링크. 스토어 등록 후 VITE_STORE_URL에 웹 스토어 주소를 넣는다. */
const STORE_URL: string = import.meta.env.VITE_STORE_URL || ''

/** 스토어 링크에는 출처를 붙여, 웹 스토어 통계에서 소개 페이지를 거쳐 온 방문을 구분한다 */
export const INSTALL_URL: string = STORE_URL
  ? `${STORE_URL}${STORE_URL.includes('?') ? '&' : '?'}utm_source=handoff-web&utm_medium=landing`
  : GITHUB_URL

export const PRIVACY_URL = '/privacy.html'

/** 웹 스토어 주소가 설정되어 있으면 "개발자 모드로 직접 설치" 안내를 숨긴다. */
export const IS_STORE_LISTED = Boolean(STORE_URL)
