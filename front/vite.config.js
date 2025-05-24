import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega env files baseado no modo (.env.production ou .env.development)
  // eslint-disable-next-line no-undef
  loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],    
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/uploads': {
          target: 'http://localhost:3002',
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3002',
          changeOrigin: true
        }
      }
    },
    build: {
      // Garantir que os caminhos relativos sejam preservados
      assetsInlineLimit: 0
    }
  }
})
