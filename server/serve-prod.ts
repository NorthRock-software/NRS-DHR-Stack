import type { AppLoadContext, ServerBuild } from 'react-router';
import type { Context } from 'hono';
import * as colors from 'jsr:@std/fmt/colors';
import * as path from 'jsr:@std/path';
import { Hono } from 'hono';
import { getConnInfo, serveStatic } from 'hono/deno';
import {
	BUILD,
	CLIENT_ASSETS_PATH,
	CLIENT_BUILD_PATH,
	CWD,
	EXECUTABLE_ROOT_DIR,
	IS_EXECUTABLE,
	IS_PROUCTION,
	MODE,
} from './helpers.ts';
import { createMiddleware } from 'hono/factory';
import { createRequestHandler } from 'react-router';
// import { upgradeWebSocket } from 'hono/deno'

// --- React-Router ---
interface ReactRouterMiddlewareOptions {
	build: ServerBuild | string;
	mode?: 'development' | 'production';
	getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
}

export const requestHandlerReactRouter = ({
	build,
	mode,
	getLoadContext = (c) => c.env as unknown as AppLoadContext,
}: ReactRouterMiddlewareOptions) => {
	return createMiddleware(async (c) => {
		// console.log(typeof build);
		// const resolvedBuild = await build;
		// const resolvedBuild = build; //* dev
		// const resolvedBuild = await import(build); //* prod
		const resolvedBuild = IS_PROUCTION ? await import(build as string) : build;
		// console.log(await resolvedBuild().then((r) => r.assets));

		const requestHandler = createRequestHandler(resolvedBuild, mode);
		const loadContext = getLoadContext(c);
		// console.log({ loadContext });
		return await requestHandler(
			c.req.raw,
			loadContext instanceof Promise ? await loadContext : loadContext,
		);
	});
};

// --- Hono ---
export const routesProd = new Hono();
// const SERVER_BUILD_PATH = path.resolve(CWD, 'build', 'server');
// // const SERVER_BUILD_PATH = "./build/server";
// let build = path.toFileUrl(SERVER_BUILD_PATH + '/index.js').href;
// // let CLIENT_BUILD_PATH = './build/client';
// // let CLIENT_ASSETS_PATH = './build/client/assets';
// if (EXECUTABLE_ROOT_DIR) {
// 	build = path.toFileUrl(EXECUTABLE_ROOT_DIR + '/build/server/index.js').href;
// 	// CLEINT_ASSETS_PATH = path.resolve(
// 	//   EXECUTABLE_ROOT_DIR,
// 	//   "build",
// 	//   "client",
// 	//   "assets",
// 	// );
// 	// CLIENT_BUILD_PATH = path.resolve(EXECUTABLE_ROOT_DIR, "build", "client");
// 	// CLIENT_BUILD_PATH = EXECUTABLE_ROOT_DIR + '/build/client';
// 	// CLIENT_ASSETS_PATH = EXECUTABLE_ROOT_DIR + '/build/client/assets';
// 	// CLIENT_BUILD_PATH = path.relative(
// 	// 	Deno.cwd(),
// 	// 	path.resolve(EXECUTABLE_ROOT_DIR, 'build', 'client'),
// 	// );
// 	// CLIENT_ASSETS_PATH = path.relative(
// 	// 	Deno.cwd(),
// 	// 	path.resolve(EXECUTABLE_ROOT_DIR, 'build', 'client', 'assets'),
// 	// );
// 	// const xx_path = '/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client/assets/home-BqPzxRqT.js';
// 	// console.log({ CLIENT_BUILD_PATH });
// 	// console.log({ CLIENT_ASSETS_PATH });
// 	// // C:\Users\Daniel\AppData\Local\Temp\deno-compile-ncon.exe/build/client
// 	// // C:\Users\Daniel\AppData\Local\Temp\deno-compile-ncon.exe/build/client/assets
// 	// const posixPath = (path: string) => {
// 	// 	return path.slice(2).replace(/\\/g, '/');
// 	// };
// 	// const CLIENT_BUILD_PATH_test = posixPath(EXECUTABLE_ROOT_DIR + '/build/client');
// 	// const CLIENT_ASSETS_PATH_test = posixPath(EXECUTABLE_ROOT_DIR + '/build/client/assets');
// 	// console.log({ CLIENT_BUILD_PATH_test, CLIENT_ASSETS_PATH_test });
// 	// // read content of file
// 	// // const fileContent = await Deno.readTextFile(CLIENT_ASSETS_PATH + '/entry.client-QXTdekNv.js');
// 	// // const fileContent = await Deno.open(CLIENT_ASSETS_PATH + '/entry.client-QXTdekNv.js');
// 	// // using file = await Deno.open(CLIENT_ASSETS_PATH + '/entry.client-QXTdekNv.js', { read: true, write: true });
// 	// using file = await Deno.open(CLIENT_ASSETS_PATH + '/entry.client-QXTdekNv.js');
// 	// const decoder = new TextDecoder();
// 	// for await (const chunk of file.readable) {
// 	// 	console.log(decoder.decode(chunk));
// 	// }
// 	// console.log(CLIENT_ASSETS_PATH + '/entry.client-QXTdekNv.js');
// }
// CLIENT_BUILD_PATH_test: "/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client",
// CLIENT_ASSETS_PATH_test: "/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client/assets"
// routesProd.use('*', () => {
// 	// log curent working directory
// 	const cwd = Deno.cwd();
// 	console.log(colors.yellow('CWD'), cwd);
// 	// log executable root directory
// 	if (EXECUTABLE_ROOT_DIR) {
// 		console.log(colors.yellow('EXECUTABLE_ROOT_DIR'), EXECUTABLE_ROOT_DIR);
// 	}
// });
// --- Routes ---
// routesProd.use("*", serveStatic({ root: "./build/client" }));
// routesProd.use(`/assets/*`, serveStatic({ root: "./build/client/assets" }));
// routesProd.use(
// 	'*',
// 	serveStatic({
// 		// root: '/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client',
// 		root: './',
// 		rewriteRequestPath: (path) => path.replace(/^\/assets/, CLIENT_ASSETS_PATH),
// 	}),
// );

// https://github.com/honojs/hono/blob/ebc7e4bf4f9546404b4d436dd673069c432e71ca/src/adapter/deno/serve-static.ts

// routesProd.use(
// 	`/assets/*`,
// 	serveStatic({
// 		root: '/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client/',
// 		// root: '../build/client/assets',
// 		onNotFound(path, c) {
// 			console.log(colors.red('File not found'), path);
// 		},
// 	}),
// );

// routesProd.use(
// 	`/assets/*`,
// 	serveStatic({ root: '/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client' }),
// );
// routesProd.use(
// 	`/assets/*`,
// 	serveStatic({ root: '/Users/Daniel/AppData/Local/Temp/deno-compile-ncon.exe/build/client/assets/' }),
// );

// routesProd.use(
// 	'/test/*',
// 	serveStatic({
// 		// C:/Users/Daniel/Desktop/test.txt
// 		root: '/Users/Daniel/Desktop', //! this works => http://localhost:3000/test/test.txt
// 		onNotFound(path, c) {
// 			console.log(colors.red('File not found'), path);
// 		},
// 	}),
// );
//! ----------------------------------------------------------------------------------------------------------------

// routesProd.use((c, next) => {
//   const connInfo = getConnInfo(c);
//   console.log(colors.yellow("connInfo"), connInfo);
//   return next();
// });
routesProd.use('*', serveStatic({ root: CLIENT_BUILD_PATH }));
routesProd.use(`/assets/*`, serveStatic({ root: CLIENT_ASSETS_PATH }));
routesProd.use(
	'*',
	requestHandlerReactRouter({
		mode: MODE,
		build: BUILD as unknown as ServerBuild,
		// @ts-ignore: somemmissing properties
		getLoadContext(c) {
			// return { context: c.env, db: "db_test", nrs_test: "nrs_test_context" };
			return c.env;
		},
	}),
);
export const createHonoServerProd = (app: Hono, port: number) => {
	Deno.serve({
		port: port,
		onListen({ hostname, port }) {
			console.log(
				colors.green(`--- Server running at http://${hostname}:${port} ---`),
			);
		},
	}, app.fetch);
};
