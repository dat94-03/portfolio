import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Project site on GitHub Pages — served at https://dat94-03.github.io/portfolio/
// so all asset URLs must be prefixed with /portfolio/.
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
})
