import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
	plugins: [sveltekit(), nodePolyfills(), topLevelAwait()],
	base: '/crypta/',
	optimizeDeps: {},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// environment: 'jsdom',
		setupFiles: 'src/lib/global-test-setup.ts',
	},
});
