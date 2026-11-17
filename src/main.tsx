import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 웹(Vercel)에서만 방문자 수·페이지 조회를 익명으로 집계한다 (쿠키 없음).
// 확장 프로그램 안에서는 실행하지 않고, 확장 프로그램 패키지에는 코드 자체가 들어가지 않는다.
if (__WEB_ANALYTICS__ && !(typeof chrome !== 'undefined' && chrome.runtime?.id)) {
  // 화면 경로는 주소의 # 뒤에 있다(HashRouter). 공유 링크(#/share/<토큰>)의 토큰에는 분석 결과가 들어 있으므로
  // 집계에는 화면 이름만 보내고 토큰은 절대 보내지 않는다.
  const currentRoute = () => {
    const path = location.hash.replace(/^#/, '').split('?')[0]
    if (!path.startsWith('/')) return '/'
    if (path.startsWith('/share/')) return '/share'
    return path
  }
  import('@vercel/analytics').then(({ inject, pageview }) => {
    inject({ beforeSend: (event) => ({ ...event, url: location.origin + currentRoute() }) })
    window.addEventListener('hashchange', () => pageview({ route: currentRoute(), path: currentRoute() }))
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
