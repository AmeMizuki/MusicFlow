import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? './MusicFlow/' : './',
  resolve: {
    alias: {
      'jsmediatags': path.resolve(__dirname, 'node_modules/jsmediatags/dist/jsmediatags.min.js')
    }
  },
  optimizeDeps: {
    include: ['jsmediatags']
  }
})
