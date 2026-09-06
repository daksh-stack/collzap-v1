import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // SockJS reaches for `global`; the browser has no such binding.
    global: 'globalThis',
  },
  server: {
    // Deep links like /chat/:id must resolve to index.html in dev.
    // No API proxy: the client always talks to VITE_API_URL.
    historyApiFallback: true,
  },
  preview: {
    historyApiFallback: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Keep three/R3F out of the entry chunk so it only downloads on /login.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/three|@react-three/.test(id)) return 'three'
          if (/react-router|react-dom|scheduler/.test(id)) return 'react'
          if (/@stomp|sockjs/.test(id)) return 'stomp'
        },
      },
    },
  },
})
