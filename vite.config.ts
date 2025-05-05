import deno from '@deno/vite-plugin';
import { defineConfig } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { parseArgs } from '@std/cli/parse-args';

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
		port: Deno.env.get('PORT') ? parseInt(Deno.env.get('PORT')!) : 3000,
	},
	//* this enables the use of deno in dev => "MODE=production react-router dev"
	// ssr: {
	// 	resolve: {
	// 		conditions: ['module', 'deno', 'node', 'development|production'],
	// 		externalConditions: ['deno', 'node'],
	// 	},
	// },
	build: {
		target: 'esnext',
		assetsInlineLimit: 50_000,
		chunkSizeWarningLimit: 350,
	},
});
