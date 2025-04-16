import { build } from 'esbuild';

await build({
	entryPoints : ['src/slider-simplex.ts', 'src/slider-simplex.css'],
	outdir      : 'dist',
	outExtension: { '.js': '.min.js', '.css': '.min.css' },
	minify      : true,
	sourcemap   : true,
	bundle      : true,
});
