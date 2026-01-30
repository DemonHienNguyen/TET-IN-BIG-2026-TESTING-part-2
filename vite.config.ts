import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Fix: Import process explicitly to provide proper types for process.cwd() in strict environments
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Tải các biến môi trường từ .env hoặc môi trường hệ thống (như Vercel)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Ép kiểu biến để đảm bảo process.env.API_KEY hoạt động trong browser code
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY || '')
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

