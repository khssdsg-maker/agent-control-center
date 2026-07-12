import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'electron/main.ts'),
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: path.resolve(__dirname, 'electron/preload.ts'),
        formats: ['cjs'],
        fileName: () => '[name].js',
      },
      outDir: 'dist-electron',
      emptyOutDir: false,
    },
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: '../../dist',
    },
    resolve: {
      alias: {
        '@': path.resolve('src/renderer'),
      },
    },
    plugins: [react()],
  },
})
