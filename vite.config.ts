import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import electron from "vite-plugin-electron/simple"
import { viteStaticCopy } from "vite-plugin-static-copy"
import svgr from "vite-plugin-svgr"
import pkg from "./package.json"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: "src/electron/main/index.ts",
        vite: {
          build: {
            outDir: "dist/electron/main",
            rollupOptions: {
              external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
            },
          }
        }
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`
        input: "src/electron/preload/index.ts",
        vite: {
          build: {
            outDir: "dist/electron/preload",
            rollupOptions: {
              external: Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
            },
          }
        }
      },
      // Optional: Use Node.js API in the Renderer process
      renderer: {}
    }),
    viteStaticCopy({
      targets: [
        {
          src: "src/electron/assets/*",
          dest: "../electron/assets/",
        }
      ]
    }),
    svgr()
  ],
  build: {
    outDir: "dist/react",
  }
})
