import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Memuat env file berdasarkan mode saat ini (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Ini adalah jembatan penting!
      // Kode aplikasi mencari 'process.env.API_KEY'
      // Kita mengisinya dengan nilai dari 'VITE_API_KEY' yang ada di file .env
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})