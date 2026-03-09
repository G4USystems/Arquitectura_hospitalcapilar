import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import netlify from '@astrojs/netlify'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { loadEnv } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load VITE_ env vars and inject as define replacements for client bundles
const env = loadEnv('production', __dirname, 'VITE_')
const envDefine = Object.fromEntries(
  Object.entries(env).map(([k, v]) => [`import.meta.env.${k}`, JSON.stringify(v)])
)

export default defineConfig({
  adapter: netlify(),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    define: envDefine,
    resolve: {
      alias: {
        '@hospital-capilar/shared': path.resolve(__dirname, '../shared/src'),
      },
      dedupe: ['react', 'react-dom', 'posthog-js', '@posthog/react', 'firebase'],
    },
    optimizeDeps: {
      include: ['posthog-js', '@posthog/react', 'posthog-js/react', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
    build: {
      commonjsOptions: {
        include: [/shared/, /node_modules/],
      },
    },
  },
  server: { port: 5174 },
})
