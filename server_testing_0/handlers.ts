// import * as colors from "jsr:@std/fmt/colors";
// import type { ViteDevServer } from "vite";
// import type { Context, Next } from "hono";
// import type {
//   AppLoadContext,
//   ServerBuild,
//   // UNSAFE_MiddlewareEnabled as MiddlewareEnabled,
//   // unstable_InitialContext,
// } from "react-router";
// import { createRequestHandler as createRequestHandlerReactRouter } from "react-router";
// import { createMiddleware } from "hono/factory";
// // export function createServerBuildImport(buildPath: string) {
// //   let build: ServerBuild | null = null;
// //   let loadPromise: Promise<ServerBuild> | null = null;

// //   async function loadBuild(): Promise<ServerBuild> {
// //     if (loadPromise) {
// //       return loadPromise;
// //     }
// //     loadPromise = import(buildPath).then((module) => {
// //       build = module.default;
// //       loadPromise = null;
// //       return build;
// //     });
// //     return loadPromise;
// //   }
// //   return async () => {
// //     if (build) {
// //       return build;
// //     }
// //     return loadBuild();
// //   };
// // }
// export const requestHandlerViteDev = ({
//   viteDevServer,
// }: {
//   viteDevServer: ViteDevServer;
// }) => {
//   return createMiddleware(async (c, next) => {
//     // const middleware = viteDevServer.middlewares;
//     // 	const { handleHotUpdate } = viteDevServer
//     return new Promise((resolve) => {
//       // viteDevServer.middlewares(c.req.raw, c.res, () => {
//       //   resolve(next());
//       // });
//       viteDevServer.middlewares(
//         c.env.incoming,
//         c.env.outgoing,
//         // resolve,

//         // resolve(next()),
//         () => resolve(next()),
//       );
//       return;
//     });
//   });
// };

// // export interface ReactRouterMiddlewareOptions {
// //   build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
// //   mode?: "development" | "staging" | "production";
// //   // Ensure getLoadContext returns the correct type or a Promise of it
// //   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// // }
// // export const ReactRouterMiddleware = ({
// //   mode,
// //   build,
// //   getLoadContext = (c: Context) => ({}) as AppLoadContext, // Provide a default empty context
// // }: ReactRouterMiddlewareOptions) => {
// //   return createMiddleware(async (c) => { // Removed 'next' as this middleware returns the final response
// //     try {
// //       const serverBuild = await build;
// //       const loadContext = await getLoadContext(c);
// //       const requestHandler = createRequestHandler({
// //         build: serverBuild,
// //         mode: mode ?? "production",
// //         getLoadContext: () => loadContext,
// //       });
// //       // Pass the request and response to the handler
// //       const response = await requestHandler(c.req.raw, c.res.raw);
// //       // Return the response
// //       return c.text(response.body, response.status); // Adjust as needed

// //       // // Resolve the build if it's a promise (for dev mode)
// //       // const resolvedBuild = await build;
// //       // const requestHandler = createReactRouterHandler(resolvedBuild, mode);

// //       // // Await the context if it's a promise
// //       // const loadContext = await getLoadContext(c);
// //       // // console.log("Load Context:", loadContext); // For debugging

// //       // // Use c.req.raw directly as it's a Fetch Request object
// //       // const response = await requestHandler(c.req.raw, loadContext);
// //       // return response; // Return the Response object from React Router
// //     } catch (error) {
// //       console.error("React Router Middleware Error:", error);
// //       return c.text("Internal Server Error", 500);
// //     }
// //   });
// // };

// // export interface ReactRouterMiddlewareOptions {
// //   build: ServerBuild | Promise<ServerBuild> | (() => Promise<ServerBuild>);
// //   mode?: "development" | "staging" | "production";
// //   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// // }

// // export function reactRouter({
// //   mode,
// //   build,
// //   getLoadContext = (c) => c.env as unknown as AppLoadContext,
// // }: ReactRouterMiddlewareOptions) {
// //   return createMiddleware(async (c) => {
// //     let requestHandler = createRequestHandler(build, mode);
// //     let loadContext = getLoadContext(c);
// //     return await requestHandler(
// //       c.req.raw,
// //       loadContext instanceof Promise ? await loadContext : loadContext,
// //     );
// //   });
// // }
// // --------------------------------------------------------------------------------------------------------------------------
// // export type GetLoadContext = (args: {
// //   request: Request;
// // }) => AppLoadContext | Promise<AppLoadContext>;

// // export const createGetLoadContextArgs = (c: Context) => {
// //   return {
// //     context: {},
// //     request: c.req.raw,
// //   };
// // };

// // interface ReactRouterMiddlewareOptions {
// //   build: ServerBuild;
// //   mode?: "development" | "production";
// //   getLoadContext: GetLoadContext;
// // }

// // export const reactRouter = (
// //   { mode, build, getLoadContext }: ReactRouterMiddlewareOptions,
// // ) => {
// //   return createMiddleware(async (c) => {
// //     const requestHandler = createRequestHandler(build, mode);
// //     const args = createGetLoadContextArgs(c);

// //     const loadContext = getLoadContext(args);
// //     return await requestHandler(
// //       c.req.raw,
// //       loadContext instanceof Promise ? await loadContext : loadContext,
// //     );
// //   });
// // };

// // type MaybePromise<T> = T | Promise<T>;

// // /**
// //  * A function that returns the value to use as `context` in route `loader` and
// //  * `action` functions when using Hono.
// //  *
// //  * You can use the Hono context `c` to access request details, environment
// //  * variables (`c.env`), or other values set by preceding middleware.
// //  */
// // export type GetLoadContextFunction = (
// //   c: Context, // Use Hono's Context object
// // ) => MiddlewareEnabled extends true ? MaybePromise<unstable_InitialContext>
// //   : MaybePromise<AppLoadContext>;

// // export type HonoRequestHandler = (
// //   c: Context,
// //   next: Next, // Hono's next function signature
// // ) => Promise<Response | void>; // Hono middleware often returns a Response or calls next()

// /**
//  * Returns a request handler for Hono that serves the response using Remix.
//  */
// // export function reactRouter({
// //   build,
// //   getLoadContext,
// //   // Use Deno.env for environment variables
// //   mode = Deno.env.get("NODE_ENV") ?? "development",
// // }: {
// //   build: ServerBuild | (() => Promise<ServerBuild>);
// //   getLoadContext?: GetLoadContextFunction;
// //   mode?: string;
// // }): HonoRequestHandler {
// //   // Create the core Remix request handler
// //   // This handler expects standard Request and returns standard Response
// //   let handleRequest = createRequestHandler(build, mode);

// //   // Return the Hono middleware function
// //   return async (c: Context, next: Next): Promise<Response | void> => {
// //     try {
// //       // Hono's context `c.req` provides the standard Request object directly
// //       const request = c.req.raw; // .raw gives the original Request

// //       // Get the Remix load context using the Hono context
// //       // const loadContext = await getLoadContext?.(c);
// //       // Process the request using Remix's handler
// //       // It consumes the standard Request and returns a standard Response
// //       // const response = await handleRequest(request, loadContext);
// //       // // Hono directly handles standard Response objects, so just return it

// //       const userLoadContext = await getLoadContext?.(c);
// //       // Ensure loadContext is at least an empty object, even if getLoadContext wasn't provided
// //       // or didn't return a value. Use nullish coalescing (??).
// //       console.log("Load Context:", c);
// //       const loadContext = userLoadContext ?? {};
// //       // Now pass the guaranteed object to the handler
// //       const response = await handleRequest(request, loadContext);
// //       return response;
// //     } catch (error: unknown) {
// //       // Hono's default error handler or a custom app.onError will catch this
// //       // Re-throw the error to let Hono handle it
// //       console.error("Remix Handler Error:", error);
// //       throw error;
// //       // Alternatively, you could return a custom error Response here:
// //       // return new Response("Internal Server Error", { status: 500 });
// //       // Or call next() if you want subsequent Hono middleware/handlers
// //       // to potentially handle the request (less common for a Remix catch-all)
// //       // await next();
// //     }
// //   };
// // }

// export function requestHandlerReactRouter<
//   Context extends AppLoadContext | undefined = undefined,
// >({
//   build,
//   mode,
//   getLoadContext,
// }: {
//   build: ServerBuild;
//   mode?: string;
//   getLoadContext?: (request: Request) => Promise<Context> | Context;
// }) {
//   return async (request: Request, loadContext?: Context) => {
//     const context = await getLoadContext?.(request);
//     // console.log("Request:", request);
//     // console.log("Load Context:", loadContext);
//     const response = await createRequestHandlerReactRouter({
//       build,
//       mode,
//       getLoadContext: () => context,
//     })(request, loadContext);
//     return response;
//   };
// }

// server/handlers.ts
import { createMiddleware } from "hono/factory";
import { createRequestHandler as baseCreateRequestHandlerReactRouter } from "react-router";
import type { AppLoadContext } from "react-router";
import type { Context } from "hono";
import type { ViteDevServer } from "vite";
import { getBuildMode, importBuild } from "./helpers.ts"; // Import helpers
import type { GetLoadContextFunction } from "./helpers.ts"; // Import type
import * as colors from "jsr:@std/fmt/colors";

interface ReactRouterMiddlewareOptions {
  viteDevServer?: ViteDevServer; // Pass Vite server only in dev
  getLoadContext: GetLoadContextFunction; // Function to get context
}

/**
 * Creates Hono middleware to handle requests using React Router.
 */
export function createReactRouterMiddleware(
  { viteDevServer, getLoadContext }: ReactRouterMiddlewareOptions,
) {
  const mode = getBuildMode();

  return createMiddleware(async (c, next) => {
    try {
      // Check if the request path looks like a static asset handled by serveStatic
      // This is an optimization to avoid unnecessary build loading for assets.
      // It assumes assets are typically served from specific paths or have extensions.
      const url = new URL(c.req.url);
      const potentialAssetPaths = ["/assets/", "/favicon.ico", "/robots.txt"]; // Add common static paths
      if (
        potentialAssetPaths.some((p) => url.pathname.startsWith(p)) ||
        /\.[a-zA-Z0-9]+$/.test(url.pathname)
      ) {
        // If serveStatic handled it, Hono v3 proceeds here. Hono v4 might stop.
        // We call next() to allow potential 404 handling if serveStatic missed it.
        // console.log(colors.gray(`[RR Middleware] Skipping likely asset: ${url.pathname}`));
        await next();
        return; // Important: stop processing in this middleware
      }

      // Import the build (re-imports in dev for HMR)
      const build = await importBuild(viteDevServer);

      // --- START DEBUG LOGGING ---
      // if (mode === "development") {
      //   console.log(
      //     colors.magenta("[RR Middleware Debug] Loaded ServerBuild Object:"),
      //   );
      //   console.dir(build, { depth: 2 }); // Log the structure of the build object
      //   // Explicitly check for unstable_middleware
      //   console.log(
      //     colors.magenta(
      //       `[RR Middleware Debug] 'unstable_middleware' in build: ${
      //         Object.prototype.hasOwnProperty.call(build, "unstable_middleware")
      //       }`,
      //     ),
      //   );
      //   // Check for other core properties
      //   console.log(
      //     colors.magenta(
      //       `[RR Middleware Debug] 'routes' in build: ${
      //         Object.prototype.hasOwnProperty.call(build, "routes")
      //       }`,
      //     ),
      //   );
      //   console.log(
      //     colors.magenta(
      //       `[RR Middleware Debug] 'assets' in build: ${
      //         Object.prototype.hasOwnProperty.call(build, "assets")
      //       }`,
      //     ),
      //   );
      // }
      // --- END DEBUG LOGGING ---

      // Basic check before proceeding (already done in importBuild, but safe to double-check)
      if (
        !build || typeof build.routes === "undefined" ||
        typeof build.assets === "undefined"
      ) {
        console.error(
          colors.red(
            "[RR Middleware] ❌ Invalid ServerBuild object structure received.",
          ),
          build,
        );
        return c.text("Internal Server Error: Invalid ServerBuild", 500);
      }

      // Get the application-specific context
      const loadContext = await getLoadContext({
        ...c,
        unstable_middleware: {},
      });

      // Create the request handler instance
      const requestHandler = baseCreateRequestHandlerReactRouter({
        build,
        mode,
        // Pass the resolved context function to React Router
        getLoadContext: () => loadContext,
      });

      // Let React Router handle the request
      console.log(
        colors.cyan(
          `[RR Middleware] Handling request: ${c.req.method} ${url.pathname}`,
        ),
      );
      const response = await requestHandler(); // Pass the raw Request object

      // Set server timing header for Remix Dev Tools
      // response.headers.set("Server-Timing", `ssr;dur=${ssrTime}`);

      return response;
    } catch (error) {
      // Log the error
      console.error(colors.red("[RR Middleware] Error:"), error);

      // In development, let Vite format the error stack trace
      if (viteDevServer && error instanceof Error) {
        viteDevServer.ssrFixStacktrace(error);
      }

      // Optionally: Provide a custom error page or re-throw for Hono's global handler
      // For now, return a generic 500 response
      return c.text("Internal Server Error", 500);
      // Or rethrow: throw error;
    }
  });
}
