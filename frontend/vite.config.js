import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  define: {
    // SockJS reaches for `global`; the browser has no such binding.
    // Harmless server-side, where global === globalThis already.
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
    // Separate out dirs so the SSR pass's emptyOutDir never touches dist/.
    outDir: isSsrBuild ? 'dist-ssr' : 'dist',
    sourcemap: false,
    // manualChunks is a client-only concern — leaking it into the SSR pass
    // fragments a bundle that only ever gets imported once, by Node.
    ...(isSsrBuild
      ? {}
      : {
          rollupOptions: {
            output: {
              manualChunks(id) {
                if (!id.includes('node_modules')) return
                if (/react-router|react-dom|scheduler/.test(id)) return 'react'
                if (/@stomp|sockjs/.test(id)) return 'stomp'
                // Animation is the landing page's largest non-React dependency
                // and nothing above the fold needs it to paint text.
                if (/[\\/]motion|framer-motion|[\\/]lenis/.test(id)) return 'motion'
              },
            },
          },
        }),
  },
}))
