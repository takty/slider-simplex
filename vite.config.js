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
				main       : resolve('src/_docs', 'index.html'),
				show_fade  : resolve('src/_docs', 'show-fade.html'),
				show_slide : resolve('src/_docs', 'show-slide.html'),
				show_scroll: resolve('src/_docs', 'show-scroll.html'),
				hero       : resolve('src/_docs', 'hero.html'),
			}
		}
	},
	plugins: [],
});
