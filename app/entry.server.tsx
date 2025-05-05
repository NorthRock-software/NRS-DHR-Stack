import type { AppLoadContext, EntryContext } from 'react-router';
import { ServerRouter } from 'react-router';
import { isbot } from 'isbot';
import type { RenderToPipeableStreamOptions } from 'react-dom/server';

const MODE = Deno.env.get('MODE') ?? 'development';
const IS_PROUCTION = MODE === 'production';

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
			controller.abort();
		}, streamTimeout + 1_000);
		const body = await renderToReadableStream(
			<ServerRouter context={routerContext} url={request.url} />,
			{
				onError(error: unknown) {
					responseStatusCode = 500;
					if (shellRendered) {
						console.error(error);
					}
				},
				signal: controller.signal,
			},
		);
		shellRendered = true;

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

	handleRequest = function handleRequest(
		request: Request,
		responseStatusCode: number,
		responseHeaders: Headers,
		routerContext: EntryContext,
		loadContext: AppLoadContext,
		// loadContext: unstable_RouterContextProvider
	) {
		return new Promise((resolve, reject) => {
			let shellRendered = false;
			let userAgent = request.headers.get('user-agent');

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
						if (shellRendered) {
							console.error(error);
						}
					},
				},
			);

			setTimeout(abort, streamTimeout + 1_000);
		});
	};
}
export default handleRequest;
