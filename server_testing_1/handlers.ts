// import type { AppLoadContext, ServerBuild } from "react-router";
// import type { Context } from "hono";
// import { createMiddleware } from "hono/factory";
// import { createRequestHandler } from "react-router";

// export interface MiddlewareOptions {
//   build: ServerBuild;
//   mode?: "development" | "production";
//   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// }
// // declare module '@remix-run/node' {
// // 	interface AppLoadContext {
// // 		// Add your custom context here
// // 		db: any;
// // 	}
// // }
// export const ReactRouterMiddleware = ({
//   mode,
//   build,
//   // getLoadContext = (c) => c.env as unknown as AppLoadContext,
//   getLoadContext = (c) => c.env,
// }: MiddlewareOptions) => {
//   // const requestHandler = createRequestHandler(build, mode);
//   return createMiddleware(async (c, next) => {
//     const requestHandler = createRequestHandler(build, mode);
//     const loadContext = getLoadContext(c);
//     // const loadContext = await c.env;
//     // console.log({ loadContext });
//     return await requestHandler(
//       c.req.raw,
//       loadContext instanceof Promise ? await loadContext : loadContext,
//     );
//   });
// };

// export const ViteDevMiddleware = ({
//   viteDevServer,
// }: {
//   viteDevServer: any;
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
//         resolve(next()),
//         // () => resolve(next()),
//       );
//       return;
//     });
//   });
// };

// --------------------------------------------------------------------------------------------

// import type { AppLoadContext, ServerBuild } from "react-router"; // Use standard server types
// import type { Context } from "hono";
// import { createMiddleware } from "hono/factory";
// import { createRequestHandler as createReactRouterHandler } from "react-router"; // Rename to avoid confusion
// import type * as vite from "vite"; // Import Vite types

// export interface ReactRouterMiddlewareOptions {
//   build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
//   mode?: "development" | "production";
//   // Ensure getLoadContext returns the correct type or a Promise of it
//   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// }

// // Define a default LoadContext structure if needed, or rely on inference
// // You might want to define this based on what your loaders actually need
// // export interface MyLoadContext extends AppLoadContext {
// //   db?: string;
// //   nrs_test?: string;
// //   // Add other context properties derived from the request (c) if necessary
// //   // e.g., clientIp: string;
// // }

// export const ReactRouterMiddleware = ({
//   mode,
//   build,
//   getLoadContext = (c) => ({}) as AppLoadContext, // Provide a default empty context
// }: ReactRouterMiddlewareOptions) => {
//   return createMiddleware(async (c) => { // Removed 'next' as this middleware returns the final response
//     try {
//       // Resolve the build if it's a promise (for dev mode)
//       const resolvedBuild = await build;
//       const requestHandler = createReactRouterHandler(resolvedBuild, mode);

//       // Await the context if it's a promise
//       const loadContext = await getLoadContext(c);
//       // console.log("Load Context:", loadContext); // For debugging

//       // Use c.req.raw directly as it's a Fetch Request object
//       const response = await requestHandler(c.req.raw, loadContext);
//       return response; // Return the Response object from React Router
//     } catch (error) {
//       console.error("React Router Middleware Error:", error);
//       // Optionally: Log error to Sentry here
//       return c.text("Internal Server Error", 500); // Return a generic error response
//     }
//   });
// };

// // Hono middleware adapter for Vite
// // This requires careful handling as Vite's middleware expects Node-like req/res
// // A common approach is to polyfill or adapt.
// // This is a *simplified* conceptual adaptation. Real-world usage might need
// // a more robust adapter library if one exists for Hono + Vite, or more complex handling.
// export const ViteDevMiddleware = ({
//   viteDevServer,
// }: {
//   viteDevServer: vite.ViteDevServer;
// }) => {
//   return createMiddleware(async (c, next) => {
//     try {
//       // This is a *potential* way to handle it, mileage may vary.
//       // It tries to let Vite handle the request, and if Vite doesn't, proceeds to the next Hono middleware.
//       await new Promise<void>((resolve, reject) => {
//         viteDevServer.middlewares(
//           c.req.raw as any,
//           c.res as any,
//           (err?: unknown) => {
//             if (err) {
//               reject(err); // Propagate Vite middleware errors
//             } else {
//               // If Vite middleware calls next(), it means it didn't handle the request
//               // and we should continue with Hono's middleware chain.
//               resolve();
//             }
//           },
//         );
//         // Note: Hono's c.res is not a direct Node ServerResponse. This adaptation
//         // might be incomplete or require polyfills/shims depending on what Vite expects.
//         // If Vite *does* handle the request (e.g., serves a module), it should write to
//         // `c.res` and end the response. Hono might not automatically pick that up unless
//         // the adapter is sophisticated. If Vite *doesn't* write to the response and calls next(),
//         // we resolve the promise and call `await next()`.
//       });
//       // If the promise resolved without Vite handling it, call the next Hono middleware
//       await next();
//     } catch (error) {
//       console.error("Vite Middleware Error:", error);
//       // Decide how to handle Vite errors (e.g., return 500 or call next())
//       await next(); // Or return an error response: return c.text('Vite Error', 500);
//     }
//   });
// };

// --- Potentially Add other Handlers ---
// Example: Rate Limiter (Conceptual - requires a library like 'hono-rate-limiter' or custom logic)
/*
import { rateLimiter } from 'hono-rate-limiter';

export const createRateLimiter = (options: { windowMs: number; limit: number }) => {
  return rateLimiter({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-6', // Recommended
    keyGenerator: (c) => {
      // Use Fly.io header or fallback to IP (Ensure Fly header is trusted)
      const flyIp = c.req.header('fly-client-ip');
      const realIp = c.req.header('x-forwarded-for')?.split(',')[0].trim(); // Basic IP extraction
      return flyIp || realIp || c.req.header('host') || 'unknown'; // Need a reliable key
    },
  });
};
*/

// --------------------------------------------------------------------------------------------

// import type { AppLoadContext, ServerBuild } from "react-router"; // Use Remix types if using Remix adapter, or react-router types directly if available
// import type { Context } from "hono";
// import { createMiddleware } from "hono/factory";
// import { createRequestHandler as createReactRouterHandler } from "react-router";
// // import type * as vite from "vite"; // Import Vite types

// export interface ReactRouterMiddlewareOptions {
//   build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
//   mode?: "development" | "production";
//   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// }

// // Define your expected LoadContext structure based on what loaders need
// export interface MyLoadContext extends AppLoadContext {
//   clientIp?: string;
//   // Add other context properties derived from the request (c) if necessary
//   // e.g., db: YourDbType; user: UserType | null;
// }

// export const ReactRouterMiddleware = ({
//   mode,
//   build,
//   // Provide a default getLoadContext that returns an empty object typed correctly
//   // getLoadContext = (c): MyLoadContext => ({
//   //   clientIp: c.req.header("fly-client-ip") ||
//   //     c.req.header("x-forwarded-for")?.split(",")[0].trim() || "unknown",
//   // }),
//   getLoadContext = (c) => ({}) as MyLoadContext, // Provide a default empty context
// }: ReactRouterMiddlewareOptions) => {
//   return createMiddleware(async (c) => { // Removed 'next' as this middleware returns the final response or handles errors
//     try {
//       // Resolve the build if it's a promise (for dev mode)
//       const resolvedBuild = await build;

//       // Ensure createReactRouterHandler exists and is the correct function for your setup
//       if (typeof createReactRouterHandler !== "function") {
//         console.error(
//           "Error: createRequestHandler (or equivalent) not imported correctly from React Router adapter.",
//         );
//         return c.text("Server Configuration Error", 500);
//       }

//       const requestHandler = createReactRouterHandler(resolvedBuild, mode);

//       // Await the context if it's a promise
//       const loadContext = await getLoadContext(c);
//       // console.log("Load Context:", loadContext); // For debugging

//       // Use c.req.raw directly as it's a Fetch Request object
//       const response = await requestHandler(c.req.raw, loadContext);

//       // --- Workaround for "Headers immutable" ---
//       // If the error persists, try reconstructing the response.
//       // Hono might handle the original Response better, so try returning it directly first.
//       // If errors occur, uncomment the reconstruction:

//       if (response) {
//         const body = response.body;
//         const headers = new Headers(response.headers); // Create mutable copy
//         const status = response.status;
//         const statusText = response.statusText;
//         return new Response(body, { status, statusText, headers });
//       } else {
//         // Should not happen if requestHandler works correctly, but handle defensively
//         console.error("React Router requestHandler returned undefined/null");
//         return c.text("Internal Server Error", 500);
//       }

//       // --- End Workaround ---

//       // Return the Response object directly from React Router first
//       return response;
//     } catch (error) {
//       console.error("React Router Middleware Error:", error);
//       // Optionally: Log error to Sentry here if integrated
//       // Check if error is Response, if so, return it (e.g., redirects thrown)
//       if (error instanceof Response) {
//         return error;
//       }
//       return c.text("Internal Server Error", 500); // Return a generic error response
//     }
//   });
// };

// // --- ViteDevMiddleware Removed ---
// // Development Integration Strategy:
// // 1. Run `vite dev` separately.
// // 2. Configure `vite.config.ts` `server.proxy` to forward requests to this Hono server.
// // 3. Hono uses `viteDevServer.ssrLoadModule` in `getServerBuild` (in index.ts) to load the app.
// /*
// export const ViteDevMiddleware = (...) => { ... } // Removed
// */

// // --- Rate Limiter Placeholder ---
// /*
// import { rateLimiter } from 'hono-rate-limiter'; // Example, install if needed

// export const createRateLimiter = (options: { windowMs: number; limit: number }) => {
//   return rateLimiter({
//     windowMs: options.windowMs,
//     limit: options.limit,
//     standardHeaders: 'draft-6', // Recommended
//     keyGenerator: (c) => {
//       const flyIp = c.req.header('fly-client-ip'); // Trust Fly.io header
//       const realIp = c.req.header('x-forwarded-for')?.split(',')[0].trim();
//       return flyIp || realIp || 'unknown_ip'; // Need a reliable key
//     },
//     // Optional: Store for distributed environments (e.g., using Redis or Deno KV)
//     // store: ...
//   });
// };
// */

// --------------------------------------------------------------------------------------------

// import type { AppLoadContext, ServerBuild } from "react-router";
// import type { Context } from "hono";
// import { createMiddleware } from "hono/factory";
// // Import the correct request handler function from react-router
// // Depending on your react-router version/adapter, it might be directly 'react-router'
// // or a specific adapter package if one exists for generic fetch/web standards.
// import { createRequestHandler as createReactRouterHandler } from "react-router";

// export interface ReactRouterMiddlewareOptions {
//   /** The server build, potentially a promise in dev mode */
//   build: ServerBuild | Promise<ServerBuild>;
//   /** The application mode */
//   mode?: "development" | "production";
//   /** Function to create the AppLoadContext for loaders/actions */
//   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// }

// /**
//  * Define your application's specific LoadContext structure.
//  * Extend AppLoadContext and add any custom fields your loaders/actions need.
//  */
// export interface MyLoadContext extends AppLoadContext {
//   clientIp?: string;
//   // Add other context properties derived from the request (c) if necessary
//   // e.g., db: YourDbType; user: UserType | null;
// }

// /**
//  * Hono middleware to handle requests with React Router.
//  */
// export const ReactRouterMiddleware = ({
//   mode,
//   build,
//   // Define a default getLoadContext, extracting common info like IP
//   getLoadContext = (c): MyLoadContext => {
//     // Prioritize Fly.io header, fallback to X-Forwarded-For, then default
//     const clientIp = c.req.header("fly-client-ip") ||
//       c.req.header("x-forwarded-for")?.split(",")[0].trim() || // Basic parsing
//       "unknown";
//     return {
//       clientIp: clientIp,
//       // Initialize other context fields if necessary
//     };
//   },
// }: ReactRouterMiddlewareOptions) => {
//   return createMiddleware(async (c) => {
//     try {
//       // 1. Resolve the build (important for dev mode where it's loaded dynamically)
//       const resolvedBuild = await build;

//       // 2. Create the React Router request handler instance
//       // Ensure createReactRouterHandler is correctly imported and functional
//       if (typeof createReactRouterHandler !== "function") {
//         console.error(
//           "Error: createRequestHandler not imported correctly from React Router.",
//         );
//         throw new Error("Server Configuration Error");
//       }
//       const requestHandler = createReactRouterHandler(resolvedBuild, mode);

//       // 3. Get the load context (await if it returns a promise)
//       const loadContext = await getLoadContext(c);
//       // console.log("Load Context:", loadContext); // Debugging

//       // 4. Handle the request using React Router
//       // Pass the raw Fetch Request object (c.req.raw) and context
//       const response = await requestHandler(c.req.raw, loadContext);

//       // 5. Return the Response
//       // React Router's handler should return a standard Fetch Response object.
//       // Hono will handle sending this response.
//       // If you encounter "Headers are immutable" errors, you might need to
//       // reconstruct the response like this:
//       // const body = response.body;
//       // const headers = new Headers(response.headers); // Creates mutable copy
//       // const status = response.status;
//       // const statusText = response.statusText;
//       // return new Response(body, { status, statusText, headers });
//       // But try returning the direct response first.
//       return response;
//     } catch (error) {
//       console.error("React Router Middleware Error:", error);

//       // If the error is already a Response (e.g., redirect thrown from loader), return it
//       if (error instanceof Response) {
//         return error;
//       }

//       // Optionally: Log error to Sentry or other monitoring service here
//       // if (SENTRY_ENABLED) { Sentry.captureException(error); }

//       // Return a generic error response
//       return c.text("Internal Server Error", 500);
//     }
//   });
// };

// --- ViteDevMiddleware Removed ---
// The recommended approach is to run `vite dev` separately and configure
// its `server.proxy` in `vite.config.ts` to point to this Hono server (e.g., http://localhost:3000).
// The Hono server only needs the Vite instance in dev to load the SSR build (`ssrLoadModule`).

// --- Optional: Rate Limiter (Conceptual) ---
/*
import { rateLimiter } from 'hono-rate-limiter'; // Needs: deno add npm:hono-rate-limiter

export const createRateLimiter = (options: { windowMs: number; limit: number }) => {
  return rateLimiter({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-6', // Or true
    keyGenerator: (c) => {
      // Use Fly.io header or fallback to IP (Ensure Fly header is trusted)
      const flyIp = c.req.header('fly-client-ip');
      const realIp = c.req.header('x-forwarded-for')?.split(',')[0].trim();
      // Need a reliable key - consider Deno.networkInterfaces() info if available in context?
      // Or rely solely on trusted headers from your proxy.
      return flyIp || realIp || 'unknown_ip';
    },
    // store: // For distributed environments, integrate with Deno KV or Redis etc.
  });
};
*/

// --- ViteDevMiddleware REMOVED ---
// As explained, direct Vite middleware integration in Hono/Deno is complex.
// The recommended approach is:
// 1. Run `vite dev` in a separate process.
// 2. Configure `vite.config.ts` `server.proxy` to forward requests to this Hono server.
// 3. This Hono server uses `viteDevServer.ssrLoadModule` (in server.ts) only to load the app code.

// --- Rate Limiter Placeholder ---
/*
import { rateLimiter } from 'hono-rate-limiter'; // Example: Install 'hono-rate-limiter'

export function createRateLimiter(options: { windowMs: number; limit: number }) {
  return rateLimiter({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-6', // Use standard draft-6 headers
    keyGenerator: (c: Context) => {
      // Prioritize trusted proxy headers, then fallback
      const flyIp = c.req.header('fly-client-ip'); // Example: Fly.io
      const xff = c.req.header('x-forwarded-for')?.split(',')[0].trim();
      const remoteIp = c.env?.remoteAddr?.hostname; // Deno native connection info
      return flyIp || xff || remoteIp || 'unknown_key'; // Ensure a key is always generated
    },
    // Optional: Configure a store (e.g., Deno KV, Redis) for distributed environments
    // store: (key, value) => { /* Deno KV logic * / },
  });
}
*/

// --------------------------------------------------------------------------------------------

import type { ViteDevServer } from "vite";
import type { ServerResponse } from "node:http"; // Node types needed for Vite compatibility
import type { AppLoadContext, ServerBuild } from "react-router";
import type { Context } from "hono";
import { createRequestHandler } from "react-router";
import { createMiddleware } from "hono/factory";
/**
 * Creates Hono middleware to integrate Vite's dev server.
 * Note: Compatibility between Deno's native server and Vite's Node-based middleware can be complex.
 * This attempts a basic integration. More robust solutions might involve adapters.
 */
// export const viteDevMiddleware = ({ viteDevServer }: {
//   viteDevServer: ViteDevServer;
// }) => {
//   return createMiddleware(async (c, next) => {
//     const req = c.req.raw;

//     // Hono doesn't directly expose a Node-like `res`. We rely on `next()`
//     // and Hono handling the response if Vite doesn't.
//     // This is experimental and might not fully work depending on the Hono adapter.
//     try {
//       await new Promise<void>((resolve) => {
//         // We need a mock 'res' or rely on Vite not needing it explicitly for all cases
//         // If Vite *does* handle the request (e.g., serves /@vite/client), it should end the response.
//         // If not, it calls the callback (our resolve).
//         viteDevServer.middlewares(req as any, {} as ServerResponse, () => {
//           // Vite didn't handle it, proceed to next Hono middleware
//           resolve();
//         });
//       });
//       // If the promise resolved, Vite didn't handle the request fully.
//       await next();
//     } catch (e) {
//       // Handle errors from Vite middleware if necessary
//       console.error("Error in Vite middleware:", e);
//       // Decide how to respond, e.g., internal server error
//       return c.text("Internal Server Error", 500);
//       // Or maybe just call next() if the error is recoverable
//       // await next();
//     }
//   });
// };

// --- Alternative (Simpler, potentially less reliable) ---
// export const viteDevMiddleware = (
//   { viteDevServer }: { viteDevServer: ViteDevServer },
// ) => {
//   return async (c, next) => {
//     // Directly use the raw fetch Request/Response if Hono/Vite supports it
//     // This depends heavily on Vite's `middlewareMode` internals
//     viteDevServer.middlewares(c.req.raw as any, c.res as any, next);
//   };
// };
export const ViteDevMiddleware = ({
  viteDevServer,
}: {
  viteDevServer: any;
}) => {
  return createMiddleware(async (c, next) => {
    // const middleware = viteDevServer.middlewares;
    // 	const { handleHotUpdate } = viteDevServer
    return new Promise((resolve) => {
      // viteDevServer.middlewares(c.req.raw, c.res, () => {
      //   resolve(next());
      // });
      viteDevServer.middlewares(
        c.env.incoming,
        c.env.outgoing,
        // resolve,
        resolve(next()),
        // () => resolve(next()),
      );
      return;
    });
  });
};

// export interface ReactRouterMiddlewareOptions {
//   build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
//   mode?: "development" | "production";
//   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
// }
// export const ReactRouterMiddleware = ({
//   mode,
//   build,
//   // getLoadContext = (c) => c.env as unknown as AppLoadContext,
//   getLoadContext = (c) => c.env,
// }: ReactRouterMiddlewareOptions) => {
//   // const requestHandler = createRequestHandler(build, mode);
//   // return createMiddleware(async (c, next) => {
//   //   const requestHandler = createRequestHandler(build, mode);
//   //   const loadContext = getLoadContext(c);
//   //   // const loadContext = await c.env;
//   //   // console.log({ loadContext });
//   //   return await requestHandler(
//   //     c.req.raw,
//   //     loadContext instanceof Promise ? await loadContext : loadContext,
//   //   );
//   // });
//   return createMiddleware(async (c) => { // Removed 'next' as this middleware returns the final response
//     try {
//       // Resolve the build if it's a promise (for dev mode)
//       const resolvedBuild = await build;
//       const requestHandler = createRequestHandler(resolvedBuild, mode);

//       // Await the context if it's a promise
//       const loadContext = await getLoadContext(c);
//       // console.log("Load Context:", loadContext); // For debugging

//       // Use c.req.raw directly as it's a Fetch Request object
//       const response = await requestHandler(c.req.raw, loadContext);
//       return response; // Return the Response object from React Router
//     } catch (error) {
//       console.error("React Router Middleware Error:", error);
//       // Optionally: Log error to Sentry here
//       return c.text("Internal Server Error", 500); // Return a generic error response
//     }
//   });
// };

// bun example
// const build = await importBuild();

//    return createMiddleware(async (c) => {
//      const requestHandler = createRequestHandler(build, mode);
//      const loadContext = mergedOptions.getLoadContext?.(c, { build, mode });
//      return requestHandler(c.req.raw, loadContext instanceof Promise ? await loadContext : loadContext);
//    })(c, next);

export interface ReactRouterMiddlewareOptions {
  build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
  mode?: "development" | "production";
  getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
}

export const ReactRouterMiddleware = ({
  mode,
  build,
  getLoadContext = (c) => c.env as AppLoadContext,
}: ReactRouterMiddlewareOptions) => {
  return createMiddleware(async (c, next) => {
    try {
      // const requestHandler = createRequestHandler(build, mode);
      // const loadContext = getLoadContext(c);
      // // const loadContext = await c.env;
      // // console.log({ loadContext });
      // return await requestHandler(
      //   c.req.raw,
      //   loadContext instanceof Promise ? await loadContext : loadContext,
      // );
      const requestHandler = createRequestHandler(build, mode);
      const loadContext = getLoadContext(c);
      // const loadContext = await c.env;
      // console.log({ loadContext });
      return await requestHandler(
        c.req.raw,
        loadContext instanceof Promise ? await loadContext : loadContext,
      );
    } catch (error: any) {
      // If build loading fails, return a 500
      if (error instanceof Error && error.message.includes("server build")) {
        console.error("⛔️ Server Build Error:", error);
        return c.text("Server Build Error", 500);
      }
      // Handle other errors during request handling
      console.error("⛔️ Request Handling Error:", error);
      // Optionally send error details in dev mode
      return c.text(
        `Internal Server Error: ${error.message}`,
        500,
      );
    }
  });
};
