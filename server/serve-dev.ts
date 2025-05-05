//? https://hono.dev/docs/getting-started/nodejs

import type { AppLoadContext, ServerBuild } from 'react-router';
import type { ViteDevServer } from 'vite';
import type { Context, Next } from 'hono';
import * as colors from 'jsr:@std/fmt/colors';
import { createMiddleware } from 'hono/factory';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
// import { createNodeWebSocket } from "@hono/node-ws"; //? https://github.com/honojs/middleware/tree/main/packages/node-ws
// import { createServer } from "vite";
import { Hono } from 'hono';
import { MODE } from './helpers.ts';
import { requestHandlerReactRouter } from './serve-prod.ts';

// --- Vite ---
const viteDevServer: ViteDevServer = await import('vite')
	.then((
		vite,
	) => vite.createServer({
		server: {
			middlewareMode: true,
		},
		appType: 'custom',
	})).catch((err) => {
		console.error(err);
		throw new Error('Failed to create Vite server.');
	});

//* virtual module ID of React Router
const importDevBuild = () => {
	// "virtual:remix/server-build"
	return viteDevServer.ssrLoadModule('virtual:react-router/server-build');
};

const requestHandlerVite = () => {
	return createMiddleware((c, next) => {
		return new Promise((resolve) => {
			viteDevServer.middlewares(
				c.env.incoming,
				c.env.outgoing,
				() => resolve(next()),
			);
			return;
		});
	});
};

// --- Hono ---
export const routesDev = new Hono();

// --- Routes ---
routesDev.use('*', serveStatic({ root: './public' }));
routesDev.use('*', requestHandlerVite());
routesDev.use(
	'*',
	requestHandlerReactRouter({
		mode: MODE,
		build: await importDevBuild() as ServerBuild,
		// @ts-ignore: somemmissing properties
		getLoadContext(c) {
			return { context: c.env, db: 'ID: 89adw8hdaw89gv89awd89jhawd89ajwd89' };
		},
	}),
);

// --- Server Handler ---
export const createHonoServerDev = (app: Hono, port: number) => {
	// const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
	// const { injectWebSocket } = createNodeWebSocket({ app });

	serve({
		fetch: app.fetch,
		port: port,
	});

	const localIP = Deno.networkInterfaces().filter((i) => i.address.startsWith('192.'))[0]?.address;
	console.log(
		`\n--- DEV-ONLY - Hosted ${colors.cyan(`http://${localIP}:${port}`)} ---`,
	);
};
