import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['plane-icon.svg'],
      manifest: {
        name: 'Stampbook',
        short_name: 'Stampbook',
        description: 'Collect stamps from your real-world travels',
        theme_color: '#fffdf7',
        background_color: '#fffdf7',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          { src: 'plane-icon.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: 'plane-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ]
})
