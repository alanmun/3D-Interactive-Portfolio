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
          main: resolve(__dirname, 'index.html'),
          portfolio: resolve(__dirname, './src/portfolio.html'),
        }
      }
    }
  }
});

/*


*/