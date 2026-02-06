import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      // Resolve shared package from monorepo
      '@hospital-capilar/shared': path.resolve(__dirname, '../shared/src'),
    },
    // Ensure dependencies are resolved from quiz's node_modules
    dedupe: ['react', 'react-dom', 'posthog-js', '@posthog/react', 'firebase'],
  },
  // Pre-bundle these dependencies
  optimizeDeps: {
    include: ['posthog-js', '@posthog/react', 'posthog-js/react', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  build: {
    // Ensure shared files are bundled correctly
    commonjsOptions: {
      include: [/shared/, /node_modules/],
    },
  },
})
