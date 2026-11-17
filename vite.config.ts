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
  esbuild: {
    // 배포 빌드에서는 디버그 로그 제거 (console.error는 유지)
    pure: mode === 'production' ? ['console.log', 'console.debug'] : [],
  },
}))
