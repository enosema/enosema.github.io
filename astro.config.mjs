import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  site: 'https://www.enosema.org',
  output: 'static',
  // Directory format preserves the Jekyll-era URL space (/about/, /blog/<date>-<slug>/)
  build: { format: 'directory' },
  integrations: [vue(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
})
