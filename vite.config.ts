
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Lấy API_KEY từ biến môi trường của hệ thống hoặc Vercel
  const apiKey = env.API_KEY || env.VITE_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Ép kiểu biến để đảm bảo mã nguồn browser có thể truy cập được
      'process.env.API_KEY': JSON.stringify(apiKey)
    },
    server: {
      port: 3000
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    }
  };
});
