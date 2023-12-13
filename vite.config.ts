import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
	base: '/crypta/',
	plugins: [sveltekit(), nodePolyfills(), topLevelAwait()],
	optimizeDeps: {
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
