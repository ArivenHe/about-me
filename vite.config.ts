import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({ template: { compilerOptions: { isCustomElement: (tag) => tag === 'liquid-glass' } } })],
  resolve: { alias: { '@': new URL('./src', import.meta.url).pathname } },
  build: { cssCodeSplit: true, target: 'es2022' },
})
