import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';

const MODE = Deno.env.get('MODE') ?? 'development';
const IS_PROUCTION = MODE === 'production';

// Reject all pending promises from handler functions after 5 seconds
export const streamTimeout = 5_000;

let handleRequest = undefined;

if (IS_PROUCTION) {
	// import { renderToReadableStream } from "react-dom/server.browser";
	const { renderToReadableStream } = await import('react-dom/server');

	handleRequest = async function handleRequest(
		request: Request,
		responseStatusCode: number,
		responseHeaders: Headers,
		routerContext: EntryContext,
		// _loadContext: AppLoadContext,
	) {
		let shellRendered = false;
		const userAgent = request.headers.get('user-agent');
		// console.log("userAgent", userAgent);
		// console.log({ request });
		const controller = new AbortController();
		setTimeout(() => {
			// Abort the rendering stream after the `streamTimeout` so it has time to
			// flush down the rejected boundaries
			controller.abort();
		}, streamTimeout + 1_000);
		const body = await renderToReadableStream(
			<ServerRouter context={routerContext} url={request.url} />,
			{
				onError(error: unknown) {
					responseStatusCode = 500;
					// Log streaming rendering errors from inside the shell. Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error);
					}
				},
				signal: controller.signal,
			},
		);
		shellRendered = true;

		// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
		// https://react.dev/reference/react-dom/server/renderToReadableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
		if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
			await body.allReady;
		}

		responseHeaders.set('Content-Type', 'text/html');
		return new Response(body, {
			headers: responseHeaders,
			status: responseStatusCode,
		});
	};
} else {
	const { PassThrough } = await import('node:stream');
	const { createReadableStreamFromReadable } = await import(
		'@react-router/node'
	);
	const { ServerRouter } = await import('react-router');
	const { isbot } = await import('isbot');
	const { renderToPipeableStream } = await import('react-dom/server');

	// export default function handleRequest(
	handleRequest = function handleRequest(
		request: Request,
		responseStatusCode: number,
		responseHeaders: Headers,
		routerContext: EntryContext,
		loadContext: AppLoadContext,
		// If you have middleware enabled:
		// loadContext: unstable_RouterContextProvider
	) {
		return new Promise((resolve, reject) => {
			let shellRendered = false;
			let userAgent = request.headers.get('user-agent');

			// Ensure requests from bots and SPA Mode renders wait for all content to load before responding
			// https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
			let readyOption: keyof RenderToPipeableStreamOptions =
				(userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';

			const { pipe, abort } = renderToPipeableStream(
				<ServerRouter context={routerContext} url={request.url} />,
				{
					[readyOption]() {
						shellRendered = true;
						const body = new PassThrough();
						const stream = createReadableStreamFromReadable(body);

						responseHeaders.set('Content-Type', 'text/html');

						resolve(
							new Response(stream, {
								headers: responseHeaders,
								status: responseStatusCode,
							}),
						);

						pipe(body);
					},
					onShellError(error: unknown) {
						reject(error);
					},
					onError(error: unknown) {
						responseStatusCode = 500;
						// Log streaming rendering errors from inside the shell.  Don't log
						// errors encountered during initial shell rendering since they'll
						// reject and get logged in handleDocumentRequest.
						if (shellRendered) {
							console.error(error);
						}
					},
				},
			);

			// Abort the rendering stream after the `streamTimeout` so it has time to
			// flush down the rejected boundaries
			setTimeout(abort, streamTimeout + 1_000);
		});
	};
}
export default handleRequest;
