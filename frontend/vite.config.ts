import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '127.0.0.1',
    port: 15173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:18000' },
  },
})
