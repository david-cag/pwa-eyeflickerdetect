import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Eye Flicker Detect',
        short_name: 'EyeFlicker',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '48x48',
            type: 'image/x-icon'
          }
        ]
      }
    })
  ],
  base: '/pwa-eyeflickerdetect/',
  optimizeDeps: {
    exclude: ['@mediapipe/face_mesh', '@mediapipe/camera_utils']
  },
  build: {
    commonjsOptions: {
      exclude: ['@mediapipe/face_mesh', '@mediapipe/camera_utils']
    }
  }
});
