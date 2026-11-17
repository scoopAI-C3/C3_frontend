import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
  ],
  server: {
    cors: true,
  },
  define: {
    // Vercel에서 빌드할 때(웹 배포)만 방문자 집계를 넣는다. 로컬에서 만드는 확장 프로그램 패키지에는 들어가지 않는다.
    __WEB_ANALYTICS__: JSON.stringify(process.env.VERCEL === '1'),
  },
  esbuild: {
    // 배포 빌드에서는 디버그 로그 제거 (console.error는 유지)
    pure: mode === 'production' ? ['console.log', 'console.debug'] : [],
  },
}))
