import { defineConfig } from 'vite'
import { resolve } from 'path';

export default defineConfig({
	root : 'src/_docs',
	base : './',
	build: {
		outDir     : '../../docs',
		emptyOutDir: true,

		rollupOptions: {
			input: {
				main: resolve('src/_docs', 'index.html'),
			}
		}
	},
	plugins: [],
});
