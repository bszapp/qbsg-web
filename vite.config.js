import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { APP_BASE_PATH } from './src/config/app.js'

// https://vite.dev/config/
export default defineConfig({
  base: APP_BASE_PATH,
  plugins: [vue()],
})
