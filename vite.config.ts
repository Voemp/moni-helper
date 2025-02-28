import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'src/electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/electron/main',
          }
        }
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`
        input: 'src/electron/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist/electron/preload',
          }
        }
      },
      // Optional: Use Node.js API in the Renderer process
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist/react',
  }
})
