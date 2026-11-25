import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Base path: on Vercel (or custom domain), serve from root ('/').
// On GitHub Pages without custom domain, serve from '/CourseForge/'.
// Can be overridden by setting VITE_BASE_PATH.
const basePath = process.env.VITE_BASE_PATH || (process.env.VERCEL ? '/' : '/CourseForge/');

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
