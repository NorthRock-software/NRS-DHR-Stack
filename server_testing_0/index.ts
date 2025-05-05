// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import { Hono } from "hono";
// import { serveStatic } from "hono/deno";
// import { logger } from "hono/logger";
// // import { compress } from "hono/compress";
// // import { secureHeaders } from "hono/secure-headers";
// // import { upgradeWebSocket } from 'hono/deno'
// import { createMiddleware } from "hono/factory";
// import { createRequestHandler } from "react-router";
// import type { AppLoadContext, ServerBuild } from "react-router";
// import type { Context } from "hono";
// import type { ViteDevServer } from "vite";
// import {
//   requestHandlerReactRouter,
//   requestHandlerViteDev,
// } from "./handlers.ts";
// import {
//   createGetLoadContext,
//   CWD,
//   getBuildMode,
//   // type GetLoadContextFunction,
//   importBuild,
// } from "./helpers.ts";

// const ALLOW_INDEXING = Deno.env.get("ALLOW_INDEXING") === "true";
// const CLIENT_BUILD_DIR = path.resolve(CWD, "build", "client");
// const SERVER_BUILD_DIR = path.resolve(CWD, "build", "server");
// const ASSETS_DIR = "assets";

// interface ServerOptions {
//   port?: number;
//   configure?: (app: Hono<any, any, any>) => void | Promise<void>;
//   getLoadContext?: (c: Context) => AppLoadContext | Promise<AppLoadContext>;
// }

// async function createServer(options: ServerOptions = {}) {
//   const mode = getBuildMode();
//   const IS_PROD = mode === "production";
//   const port = options.port ?? Number(Deno.env.get("PORT") ?? 3000);

//   console.log({ IS_PROD });

//   const app = new Hono({
//     strict: false,
//   });
//   // --- Core Middleware ---
//   app.use(logger());
//   // app.use(compress());

//   // --- API Routes ---
//   app.use(async (c, next) => {
//     await next();
//     c.header("X-Powered-By", "React Router and Hono");
//   });

//   // --- Custom Middleware Hook ---
//   await options.configure?.(app);

//   // --- Vite Dev Server Setup ---
//   let viteDevServer: ViteDevServer | undefined;
//   if (!IS_PROD) {
//     viteDevServer = await import("vite").then((vite) =>
//       vite.createServer({
//         server: { middlewareMode: true },
//         appType: "custom",
//         // forceOptimizeDeps: true,
//         // root: CWD, // Set root for resolving modules
//       })
//     );
//     console.log(colors.green("✅ Vite Dev Server initialized."));
//   }

//   // --- Static Asset Serving ---
//   app.use(
//     `/${ASSETS_DIR}/*`,
//     serveStatic({
//       root: `./${path.relative(CWD, CLIENT_BUILD_DIR)}`,
//       // Optional: Add caching headers for production assets
//       // middleware: IS_PROD ? [cache({ /* cache options */ })] : [],
//     }),
//     // async (c, next) => {
//     //   c.header("Cache-Control", "public, max-age=31536000, immutable");
//     //   await next();
//     // },
//     //   async (c, next) => {
//     //     // Apply cache headers only if the asset was found
//     //     if (c.res.status === 200 || c.res.status === 304) {
//     //       c.header("Cache-Control", "public, max-age=31536000, immutable");
//     //     }
//     //     await next();
//     //   },
//   );
//   // In prod, these might be in CLIENT_BUILD_DIR, in dev from ./public
//   app.use(
//     "*",
//     serveStatic({
//       root: IS_PROD ? `./${path.relative(CWD, CLIENT_BUILD_DIR)}` : "./public",
//     }),
//   );

//   // --- Application Handlers ---
//   // --- Vite Dev Middleware (Development only) ---
//   // if (!IS_PROD && viteDevServer) {
//   //   console.log(colors.yellow("ℹ️ Vite middleware integration enabled."));
//   //   // app.use("*", async (c, next) => {
//   //   //   // Use Vite's middleware to handle requests
//   //   //   viteDevServer.middlewares.handle(c.req.raw, c.res.raw, next);
//   //   // });
//   //   app.use("*", async (c, next) => {
//   //     return requestHandlerViteDev({
//   //       viteDevServer: viteDevServer,
//   //     });
//   //     // (c.req.raw, c.res.raw, () => {
//   //     //   next();
//   //     // });
//   //   });
//   //   // console.log(
//   //   //   "ℹ️ Vite middleware integration skipped by default. Add if needed.",
//   //   // );
//   // }

//   // // --- React Router Request Handler ---
//   const getLoadContext = createGetLoadContext(options.getLoadContext);
//   // // const getLoadContext = (c: Context): AppLoadContext => {
//   // //   // Example: Extract data from request or environment
//   // //   const clientIp = c.req.header("fly-client-ip") ||
//   // //     c.req.header("x-forwarded-for")?.split(",")[0].trim() || "unknown";
//   // //   return {
//   // //     // Pass data needed by your loaders/actions
//   // //     // db: getDbConnection(), // Example: get database connection
//   // //     // user: await getUserFromSession(c), // Example: get user session
//   // //     clientIp: clientIp,
//   // //     // Add any other context derived from `c` or env vars
//   // //   };
//   // // };
//   // app.use(
//   //   "*",
//   //   requestHandlerReactRouter({
//   //     mode: getBuildMode(),
//   //     build: importBuild(viteDevServer), // Pass the async function directly
//   //     getLoadContext: getLoadContext, // Pass your context function
//   //   }),
//   // );

//   // --- React Router Request Handler ---
//   // Moved build loading inside the middleware creation for dev mode HMR
//   // const getLoadContext = createGetLoadContext(options.getLoadContext);
//   // app.use(
//   //   "*",
//   //   reactRouter({
//   //     build: importBuild(
//   //       await import("vite").then((vite) =>
//   //         vite.createServer({
//   //           server: { middlewareMode: true },
//   //           forceOptimizeDeps: true,
//   //         })
//   //       ),
//   //     ),
//   //     mode: getBuildMode(),
//   //     // getLoadContext is optional, the default function is the same as here
//   //     getLoadContext(c) {
//   //       return c.env;
//   //     },
//   //   }),
//   // );

//   // app.use(
//   //   "*", // This should be the last major handler
//   //   ReactRouterMiddleware({
//   //     mode: mode,
//   //     // Pass the import function; it resolves build inside the handler
//   //     //   viteDevServer = await import("vite").then((vite) =>
//   //     //     vite.createServer({
//   //     //       server: { middlewareMode: true },
//   //     //       // forceOptimizeDeps: true,
//   //     //     })
//   //     //   );
//   //     build: async () =>
//   //       importBuild(
//   //         await import("vite").then((vite) =>
//   //           vite.createServer({
//   //             server: { middlewareMode: true },
//   //             // forceOptimizeDeps: true,
//   //           })
//   //         ),
//   //       ),

//   //     getLoadContext: getLoadContext,
//   //   }),
//   // );

//   Deno.serve({
//     port: port,
//     onListen: ({ hostname, port }) => {
//       console.log(
//         `🚀 Server in ${mode} mode is listening on http://${hostname}:${port}`,
//       );
//     },
//     onError: (error) => {
//       console.error("Deno.serve Error:", error);
//       return new Response("Internal Server Error", { status: 500 });
//     },
//   }, app.fetch);
// }

// createServer({
//   getLoadContext: (c: Context): AppLoadContext => {
//     // Example: Extract data from request or environment
//     const clientIp = c.req.header("fly-client-ip") ||
//       c.req.header("x-forwarded-for")?.split(",")[0].trim() || "unknown";
//     return {
//       clientIp: clientIp,
//       // Add any other context derived from `c` or env vars
//     };
//   },
//   // port: Number(Deno.env.get("PORT") ?? 3000),
//   configure: (app: Hono) => {
//     app.get(
//       "/api/hello",
//       (c, _next) => c.json({ message: "Hello from Hono API!" }),
//     );
//   },
// }).catch((err) => {
//   console.error("❌ Failed to create server:", err);
//   Deno.exit(1);
// });

import * as path from "jsr:@std/path";
import * as colors from "jsr:@std/fmt/colors";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { logger } from "hono/logger";
// import { compress } from "hono/compress"; // Optional: uncomment if needed
import type { AppLoadContext, ServerBuild } from "react-router"; // Added ServerBuild
import type { Context } from "hono";
import type { ViteDevServer } from "vite";
// Removed unused createReactRouterMiddleware import
import { CWD, getBuildMode } from "./helpers.ts";
import type { GetLoadContextFunction } from "./helpers.ts"; // Import type
import { createMiddleware } from "hono/factory"; // Keep this
import { createRequestHandler } from "react-router"; // Keep this

// --- Configuration ---
const CLIENT_BUILD_DIR = path.resolve(CWD, "build", "client");
// Asset path in the build output (relative to CLIENT_BUILD_DIR)
// Should match vite.config.ts build.assetsDir (defaults to 'assets')
const BUILT_ASSETS_DIR = "assets";
// Public directory for static files not processed by Vite (e.g., favicon.ico)
const PUBLIC_DIR = path.resolve(CWD, "public"); // Keep using path.resolve for clarity

interface ServerOptions {
  port?: number;
  configure?: (app: Hono<any, any, any>) => void | Promise<void>;
  getLoadContext?: GetLoadContextFunction;
}

async function createServer(options: ServerOptions = {}) {
  const mode = getBuildMode();
  const IS_PROD = mode === "production";
  const port = options.port ?? Number(Deno.env.get("PORT") ?? 3000);

  console.log(colors.yellow(`Starting server in ${mode} mode...`));

  // Removed <E> generic, it was undefined
  const app = new Hono();

  // --- Core Middleware ---
  app.use("*", logger()); // Log all requests
  // app.use(compress()); // Optional: Enable compression

  // --- Custom Middleware/Routes (e.g., API) ---
  app.use(async (c, next) => {
    // Example: Set a common header
    await next();
    c.header("X-Powered-By", "Hono + React Router");
  });
  await options.configure?.(app); // Hook for custom routes like /api/*

  // --- Vite Dev Server Setup (Development Only) ---
  let viteDevServer: ViteDevServer | undefined;
  if (!IS_PROD) {
    try {
      const vite = await import("vite");
      viteDevServer = await vite.createServer({
        server: { middlewareMode: true }, // Allows integration
        appType: "custom", // We control the HTML response
        root: CWD, // Project root directory
        // Ensure `optimizeDeps.include` in vite.config.ts is set up if needed
      });
      console.log(colors.green("✅ Vite Dev Server initialized."));

      // We will use viteDevServer?.ssrLoadModule later if needed by build import
    } catch (e) {
      console.error(colors.red("❌ Failed to initialize Vite Dev Server:"), e);
      viteDevServer = undefined;
      // Decide if server should start without Vite Dev Server
      // throw e; // Option: Fail hard if Vite is essential for dev
    }
  }

  // --- Static Asset Serving ---
  // 1. Serve built assets (immutable, cached aggressively in prod)
  const clientBuildRelativePath = path.relative(CWD, CLIENT_BUILD_DIR);
  app.use(
    `/${BUILT_ASSETS_DIR}/*`,
    serveStatic({
      root: `./${clientBuildRelativePath}`, // Serve from build/client/assets
      rewriteRequestPath: (p) => p, // Keep the path as is (e.g., /assets/...)
    }),
    async (c, next) => {
      // Add cache headers ONLY if the file was found by serveStatic and in prod
      if (IS_PROD && c.res.status === 200) {
        c.header("Cache-Control", "public, max-age=31536000, immutable");
      }
      await next();
    },
  );

  // 2. Serve public files (favicon.ico, robots.txt, etc.)
  // These should exist in /public directory
  app.use(
    "*", // Serve anything from public if it exists (runs before React Router)
    serveStatic({
      root: "./public", // Relative path to public directory
    }),
  );

  // --- React Router Handler (Catch-all for non-static, non-API routes) ---
  // Define the middleware using Hono's factory
  const reactRouterMiddleware = createMiddleware(async (c) => {
    try {
      let build: ServerBuild;
      if (IS_PROD) {
        build = await import(
          // @ts-expect-error - Virtual module provided by React Router at build time
          "virtual:react-router/server-build"
        );
      } else {
        // In dev, load fresh module for HMR
        if (!viteDevServer) {
          throw new Error(
            "Vite Dev Server is not available for SSR in development mode.",
          );
        }
        build = (await viteDevServer.ssrLoadModule(
          "virtual:react-router/server-build",
        )) as ServerBuild;
      }

      const requestHandler = createRequestHandler(build, mode);

      // Get load context, handle potential promise
      // let loadContext = options.getLoadContext ? options.getLoadContext(c) : {};
      const loadContext = options.getLoadContext?.(c, { build, mode });
      if (loadContext instanceof Promise) {
        loadContext = await loadContext;
      }

      // Delegate to React Router
      return requestHandler(c.req.raw, loadContext);
    } catch (error) {
      // Log SSR errors
      console.error(colors.red("React Router SSR Error:"), error);
      // Optionally provide a more specific error response in dev
      if (!IS_PROD) {
        return new Response(
          error instanceof Error ? error.stack : String(error),
          { status: 500 },
        );
      }
      // Generic error for production
      return c.text("Internal Server Error during SSR", 500);
    }
  });

  // Apply the React Router middleware as the final catch-all handler
  app.use("*", reactRouterMiddleware);

  // --- Error Handling ---
  // This catches errors thrown *within* Hono middleware/handlers *before* reactRouterMiddleware's catch block
  app.onError((err, c) => {
    console.error(colors.red("Unhandled Hono Middleware Error:"), err);
    // Avoid sending detailed errors in production
    return c.text("Internal Server Error", 500);
  });

  // --- Start Server ---
  console.log(
    colors.blue(
      `Serving static assets from /${BUILT_ASSETS_DIR}/* pointing to ${clientBuildRelativePath}/${BUILT_ASSETS_DIR}`,
    ),
  );
  console.log(
    colors.blue(
      `Serving public files from ./public/*`,
    ),
  );

  Deno.serve({
    port: port,
    onListen: ({ hostname, port }) => {
      console.log(
        colors.white(`🚀 Server ready at http://${hostname}:${port}`),
      );
    },
    onError: (error) => {
      // Catches errors *before* Hono (e.g., port in use)
      console.error(colors.red("Deno.serve Error:"), error);
      return new Response("Server Setup Error", { status: 500 });
    },
  }, app.fetch); // Pass Hono's fetch handler
}

// --- Server Initialization ---
createServer({
  getLoadContext: (c: Context): AppLoadContext | Promise<AppLoadContext> => {
    // Example: Provide client IP or other request-specific context
    const clientIp = c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
      c.req.header("fly-client-ip") || // Example for Fly.io
      "unknown";
    return {
      clientIp: clientIp,
      // Add other context derived from `c` or environment variables
    };
  },
  // Optional: Add API routes or other custom middleware
  configure: (app: Hono) => {
    app.get("/api/hello", (c) => {
      console.log("API request received for /api/hello");
      return c.json({ message: "Hello from Hono API!" });
    });
    // Add other API routes here...
  },
}).catch((err) => {
  console.error(colors.red("❌ Failed to create server:"), err);
  Deno.exit(1);
});
