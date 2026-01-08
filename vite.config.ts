import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    // Base ensures the app works if deployed to a subdirectory or if paths are relative
    base: './',
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});