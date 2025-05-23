import type { AppLoadContext, ServerBuild } from 'react-router';
import type { Context } from 'hono';
import * as colors from '@std/fmt/colors';
// import * as path from 'jsr:@std/path';
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
		// build; //* dev
		// await import(build); //* prod
		const resolvedBuild = IS_PROUCTION ? await import(build as string) : build;
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
			return { context: c.env, db: 'ID: 89adw8hdaw89gv89awd89jhawd89ajwd89' };
			// return c.env;
		},
	}),
);
export const createHonoServerProd = async (app: Hono, port: number) => {
	const abortController = new AbortController();

	Deno.serve({
		port: port,
		signal: abortController.signal,
		onListen({ hostname, port }) {
			console.log(
				colors.green(`--- Server running at http://${hostname}:${port} ---`),
			);
		},
	}, app.fetch);

	const handleShutdown = async (signal: Deno.Signal) => {
		console.log(
			colors.yellow(`\nReceived signal: ${signal}. Shutting down gracefully, please wait...`),
		);

		//* stop accepting new connections
		abortController.abort();
		// await closeDbConnections();

		//* wait briefly for server to finish processing existing requests
		await new Promise((resolve) => setTimeout(resolve, 500)); // grace period
		console.log(colors.yellow('Shutdown complete.'));
		Deno.exit(0);
	};
	if (Deno.build.os === 'windows') {
		console.log(colors.green('Windows OS detected. Adding signal listeners...'));
		Deno.addSignalListener('SIGINT', () => handleShutdown('SIGINT'));
	} else {
		console.log(colors.green('Linux/Unix OS detected. Adding signal listeners...'));
		Deno.addSignalListener('SIGINT', () => handleShutdown('SIGINT'));
		Deno.addSignalListener('SIGTERM', () => handleShutdown('SIGTERM'));
	}
};
