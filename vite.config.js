// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig(({}) => {
  return {
    publicDir: './static',
    build: {
      emptyOutDir: false,
      outDir: './dist',
      rollupOptions:{
        input: {
          main: resolve(__dirname, './src/index.html'),
          src: resolve(__dirname, './src/portfolio/portfolio.html'),
          whoami: resolve(__dirname, './src/whoami.html')
        }
      }
    }
  }
});