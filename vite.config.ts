import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

function normalizeBasePath(value: string | undefined) {
  if (!value) {
    return '/'
  }
  if (value === './' || value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  const base = value.startsWith('/') ? value : `/${value}`
  return base.endsWith('/') ? base : `${base}/`
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    base: normalizeBasePath(env.VITE_PUBLIC_BASE_PATH),
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    test: {
      environment: 'jsdom',
    },
  }
})
