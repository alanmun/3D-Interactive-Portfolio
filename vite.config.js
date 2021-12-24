// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({}) => {
  return {
    publicDir: './static',
    build: {
      emptyOutDir: false,
      outDir: './dist'
    }
  }
});