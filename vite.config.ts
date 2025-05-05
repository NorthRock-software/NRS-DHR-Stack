import deno from '@deno/vite-plugin';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';

// export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
export default defineConfig({
	plugins: [
		deno(),
		tailwindcss(),
		// Run the react-compiler on .tsx files only when bundling
		// {
		// 	...babel({
		// 		filter: /\.tsx?$/,
		// 		babelConfig: {
		// 			presets: ["@babel/preset-typescript"],
		// 			plugins: ["babel-plugin-react-compiler"],
		// 		},
		// 	}),
		// 	apply: "build",
		// },
		reactRouter(),
	],
	server: {
		host: true,
	},
	// base: "./",
	// root: "./",
	// publicDir: "./public",
	build: {
		target: 'esnext',
		assetsInlineLimit: 50_000,
		chunkSizeWarningLimit: 350,
	},
});
