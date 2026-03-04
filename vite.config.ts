import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mui/styled-engine': fileURLToPath(
        new URL('./node_modules/@mui/styled-engine-sc', import.meta.url),
      ),
    },
  },
})
