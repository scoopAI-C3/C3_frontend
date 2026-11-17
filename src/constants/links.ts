const GITHUB_URL = 'https://github.com/scoopAI-C3/C3_frontend'

/** 확장 프로그램 설치 링크. 스토어 등록 후 VITE_STORE_URL에 웹 스토어 주소를 넣는다. */
export const INSTALL_URL: string = import.meta.env.VITE_STORE_URL || GITHUB_URL

export const PRIVACY_URL = '/privacy.html'

/** 웹 스토어 주소가 설정되어 있으면 "개발자 모드로 직접 설치" 안내를 숨긴다. */
export const IS_STORE_LISTED = Boolean(import.meta.env.VITE_STORE_URL)
