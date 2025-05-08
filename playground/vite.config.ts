import MiniUnoCss from '@mini-unocss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
	plugins: [vue(), MiniUnoCss(), Inspect()],
})
