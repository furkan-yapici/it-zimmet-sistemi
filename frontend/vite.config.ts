import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Docker + Windows'ta dosya değişikliği bildirimi gelmediği için dosyalar düzenli aralıkla kontrol edilir
    watch: { usePolling: true, interval: 300 },
  },
})
