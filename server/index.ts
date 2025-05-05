// import * as path from "jsr:@std/path";
// // import { walk } from "jsr:@std/fs/walk"; //* https://jsr.io/@std/fs/doc/~/walk
import * as colors from 'jsr:@std/fmt/colors';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { compress } from 'hono/compress';
import { languageDetector } from 'hono/language';
// import { cache } from 'hono/cache'
// import { secureHeaders } from "hono/secure-headers"; //* https://hono.dev/docs/middleware/builtin/secure-headers
// import { csrf } from "hono/csrf"; //* https://hono.dev/docs/middleware/builtin/csrf
// import { cors } from 'hono/cors'
// import { etag } from 'hono/etag'
import { customLogger, IS_PROUCTION, MODE, PORT } from './helpers.ts';

const app = new Hono({
	strict: false,
});

// --- Middlewares ---
app.use(logger(customLogger));
app.use('*', compress());
app.use(
	languageDetector({
		supportedLanguages: ['en', 'de'],
		fallbackLanguage: 'de',
	}),
);

// --- Routes ---
app.use(async (c, next) => {
	await next();
	c.header('X-Powered-By', 'React-Router and Hono');
});
app.get('/ping', (c) => {
	return c.json({ status: 'pong' });
});
app.get('/lang', (c) => {
	const lang = c.get('language');
	return c.text(`Your language is ${lang}`);
});

if (IS_PROUCTION) {
	const { createHonoServerProd, routesProd } = await import('./serve-prod.ts');
	app.route('', routesProd);
	createHonoServerProd(app, PORT);
} else {
	const { createHonoServerDev, routesDev } = await import('./serve-dev.ts');
	app.route('', routesDev);
	createHonoServerDev(app, PORT);
}
console.log(
	`--- Hono server running on ${colors.cyan('http://localhost:' + PORT)} in mode: ${colors.cyan(MODE)} ---\n`,
);
