// import * as path from "jsr:@std/path";
// import { Hono } from "hono";
// import { serveStatic } from "hono/deno";
// import { compress } from "hono/compress";
// import { logger } from "hono/logger";
// import { ReactRouterMiddleware, ViteDevMiddleware } from "./handlers.ts";
// import { createLogger } from "vite";
// // import { upgradeWebSocket } from 'hono/deno'
// // import getPort from 'get-port';

// const app = new Hono();
// const mode = Deno.env.get("NODE_ENV") === "development"
//   ? "development"
//   : Deno.env.get("NODE_ENV");
// const isProductionMode = mode === "production";
// console.log({ isProductionMode });
// app.use(compress());
// app.use(logger());

// // this server is only used to load the dev server build
// const viteDevServer = isProductionMode
//   ? undefined
//   : await import("vite").then((vite) =>
//     vite.createServer({
//       server: { middlewareMode: true },
//       appType: "custom",
//     })
//   );
// //* virtual:react-router/server-build || virtual:remix/server-build
// const importDevBuild = async () =>
//   viteDevServer?.ssrLoadModule("virtual:react-router/server-build");

// const SERVER_BUILD_PATH = `./build/server`;
// const CLIENT_BUILD_PATH = `./build/client`;

// const cwd = Deno.env.get("REACT_ROUTER_ROOT") ?? Deno.cwd();
// const resolvedBuildDirectory = path.resolve(cwd, "build");
// const SERVER_BUILD = path.join(
//   resolvedBuildDirectory,
//   "server",
//   "index.js", //? serverBuildFile (output)
// );
// // const SERVER_BUILD_URL = new URL(SERVER_BUILD, cwd).href;
// // URL.fromLocalPath(SERVER_BUILD).href;
// // console.log("SERVER_BUILD_URL:", SERVER_BUILD_URL);
// // console.log("SERVER_BUILD:", SERVER_BUILD);

// // app.use(
// //   serveStatic({
// //     root: "./build/client",
// //   }),
// // );
// app.get("/api", (c) => {
//   return c.json({
//     message: "Hello",
//   });
// });

// app.use(`/assets/*`, serveStatic({ root: CLIENT_BUILD_PATH }));
// app.use(
//   "*",
//   serveStatic({ root: isProductionMode ? CLIENT_BUILD_PATH : "./public" }),
// );

// if (isProductionMode) {
//   // console.log(pc.blueBright("loading production build"));
//   // error: Uncaught (in promise) TypeError: Unsupported scheme "c" for module "c:\Users\Daniel\work\projects\nrs\systems\build\server\index.js". Supported schemes:
//   //  - "blob"...
//   //   const build = await import(SERVER_BUILD_URL);
//   const SERVER_BUILD_PATH = new URL(SERVER_BUILD, cwd).pathname;
//   console.log("SERVER_BUILD_PATH:", SERVER_BUILD_PATH);
//   // const build = await import(SERVER_BUILD_PATH);
//   const build = await import(
//     "/Users/Daniel/work/projects/nrs/systems/build/server/index.js"
//   );
//   app.use("*", ReactRouterMiddleware({ mode: "production", build }));
// } else {
//   // console.log(pc.blueBright("loading dev build"));
//   // const build = (await importDevBuild()) as any;
//   // console.log(build.assets); //* build.routes
//   app.use("*", ViteDevMiddleware({ viteDevServer }));
//   // server.use('*', RemixMiddleware({ mode: 'development', build }));
//   app.use("*", async (c, next) => {
//     const build = (await importDevBuild()) as any;
//     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as any })(c, next);
//     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as AppLoadContext })(c, next);
//     return ReactRouterMiddleware({
//       mode: "development",
//       build,
//       getLoadContext: (c) => {
//         return {
//           context: c,
//           db: "db",
//           nrs_test: "nrs_test_xxxx",
//         };
//       },
//     })(c, next);
//   });
// }

// // app.use(async (c, next) => {
// //   await next();
// //   c.header("X-Powered-By", "React Router and Hono");
// // });

// Deno.serve({ port: 3010 }, app.fetch);
// // export default app;

// --------------------------------------------------------------------------------------------

// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import { Hono } from "hono";
// import { serveStatic } from "hono/deno";
// import { compress } from "hono/compress";
// import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers"; // For Helmet-like functionality
// // import { sentry } from "@sentry/deno"; // Assuming Sentry Deno integration exists

// import { ReactRouterMiddleware, ViteDevMiddleware } from "./handlers.ts"; // Keep ViteDevMiddleware for now
// import type { AppLoadContext, ServerBuild } from "react-router";
// import type * as vite from "vite";

// // --- Environment Setup ---
// const MODE = Deno.env.get("NODE_ENV") === "development"
//   ? "development"
//   : "production";
// const IS_PROD = MODE === "production";
// const IS_DEV = MODE === "development";
// const ALLOW_INDEXING = Deno.env.get("ALLOW_INDEXING") !== "false";
// const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
// const SENTRY_ENABLED = IS_PROD && SENTRY_DSN;
// const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);

// console.log(colors.cyan(`Running in ${MODE} mode.`));

// // --- Sentry Initialization (Conceptual) ---
// // if (SENTRY_ENABLED) {
// //   sentry({ dsn: SENTRY_DSN /* ... other options */ });
// //   console.log(colors.green("Sentry initialized."));
// // }

// // --- Vite Dev Server Setup ---
// const viteDevServer: vite.ViteDevServer | undefined = IS_DEV
//   ? await import("vite").then((vite) =>
//     vite.createServer({
//       server: { middlewareMode: true },
//       appType: "custom", // Important for manual integration
//       // Optionally configure HMR port if needed, esp. in containers
//       // server: { hmr: { clientPort: HMR_PORT_IF_NEEDED }}
//     })
//   )
//   : undefined;

// if (IS_DEV && viteDevServer) {
//   console.log(colors.green("Vite dev server created."));
// }

// // --- Hono App Initialization ---
// const app = new Hono();

// // --- Core Middleware ---
// // 1. Sentry (if enabled and integrated)
// // app.use('*', sentry({ /* options */ })); // Add Sentry middleware early

// // 2. Logger
// app.use("*", logger((str) => console.log(str))); // Simple console log

// // 3. Compression
// app.use("*", compress());

// // 4. Secure Headers (Helmet equivalent)
// app.use(
//   "*",
//   secureHeaders({
//     xPoweredBy: false, // Disable X-Powered-By
//     referrerPolicy: "strict-origin-when-cross-origin", // Example, adjust as needed
//     // Add other security headers like CSP, HSTS etc.
//     // xFrameOptions: 'DENY',
//     // xContentTypeOptions: 'nosniff',
//     // ReferrerPolicy: 'same-origin', // Overridden above
//     // CrossOriginEmbedderPolicy: 'require-corp', // Be careful with COEP/COOP
//     // CrossOriginOpenerPolicy: 'same-origin',
//   }),
// );

// // 5. HTTPS Redirection (Fly.io specific - adjust header if using a different proxy)
// app.use("*", async (c, next) => {
//   const proto = c.req.header("X-Forwarded-Proto");
//   if (!IS_DEV && proto === "http") { // Only redirect in production/staging
//     const host = c.req.header("X-Forwarded-Host") ?? c.req.header("host");
//     if (host) {
//       const url = new URL(c.req.url);
//       url.protocol = "https:";
//       url.host = host; // Use the forwarded host
//       console.log(`Redirecting HTTP to HTTPS: ${url.toString()}`);
//       return c.redirect(url.toString(), 301); // Use 301 for permanent redirect
//     }
//   }
//   await next();
// });

// // 6. Trailing Slash Removal
// app.use("*", async (c, next) => {
//   const url = new URL(c.req.url);
//   if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
//     url.pathname = url.pathname.slice(0, -1);
//     console.log(`Removing trailing slash: ${url.toString()}`);
//     return c.redirect(url.toString(), 301); // Use 301 or 308
//   }
//   await next();
// });

// // 7. Rate Limiting (Conceptual - requires implementation/library)
// // const generalRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 1000 });
// // const strongRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 100 });
// // const strongestRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 10 });
// // const strongPaths = [ /* ... paths from original code ... */];
// // app.use('*', async (c, next) => {
// //    const method = c.req.method;
// //    const path = new URL(c.req.url).pathname;
// //    if (method !== 'GET' && method !== 'HEAD') {
// //      if (strongPaths.some(p => path.includes(p))) {
// //        return strongestRateLimit(c, next);
// //      }
// //      return strongRateLimit(c, next);
// //    }
// //    if (path.includes('/verify')) { // Special GET case
// //       return strongestRateLimit(c, next);
// //    }
// //    return generalRateLimit(c, next);
// // });

// // 8. Robots Tag
// if (!ALLOW_INDEXING) {
//   app.use("*", async (c, next) => {
//     c.header("X-Robots-Tag", "noindex, nofollow");
//     await next();
//   });
//   console.log(
//     colors.yellow("Search engine indexing disabled via X-Robots-Tag."),
//   );
// }

// // --- Static File Serving ---
// // Serve files from build/client/assets with immutable caching (prod only)
// if (IS_PROD) {
//   const clientBuildAssetsPath = path.join(
//     Deno.cwd(),
//     "build",
//     "client",
//     "assets",
//   );
//   // console.log(`Serving static assets from: ${clientBuildAssetsPath}`); // Debugging
//   app.use(
//     "/assets/*",
//     serveStatic({
//       root: path.join("build", "client"), // serveStatic needs root relative to CWD or absolute
//       rewriteRequestPath: (p) => p, // Ensure path isn't rewritten if root includes 'assets'
//       onNotFound: (path, c) => {
//         console.warn(`Asset not found: ${path}`);
//         return c.notFound();
//       },
//     }),
//     async (c, next) => { // Add immutable cache headers *after* serveStatic finds the file
//       c.header("Cache-Control", "public, max-age=31536000, immutable");
//       await next(); // Not strictly needed if serveStatic handles response, but good practice
//     },
//   );

//   // Serve other files from build/client (like favicon.ico) with shorter cache (prod only)
//   const clientBuildPath = path.join(Deno.cwd(), "build", "client");
//   // console.log(`Serving other static files from: ${clientBuildPath}`); // Debugging
//   app.use(
//     "/*", // Catch-all for other static files *not* under /assets
//     serveStatic({
//       root: path.join("build", "client"), // Serve from client root
//       onNotFound: (path, c) => {
//         // This is important: if serveStatic doesn't find the file,
//         // it MUST call next() so the request can reach the React Router handler.
//         // Hono's serveStatic usually does this by default if not found.
//         // console.log(`Static file ${path} not found, passing to React Router...`);
//       },
//     }),
//     async (c, next) => { // Add cache header *after* serveStatic finds file
//       c.header("Cache-Control", "public, max-age=3600"); // 1 hour cache
//       await next(); // See above note
//     },
//   );
// } else {
//   // In development, serve files from 'public' folder if needed
//   const publicPath = path.join(Deno.cwd(), "public");
//   // console.log(`Serving static files from: ${publicPath}`); // Debugging
//   app.use("/*", serveStatic({ root: "public" }));
// }

// // --- Application Handlers ---
// // 1. Vite Development Middleware (if applicable)
// if (IS_DEV && viteDevServer) {
//   // IMPORTANT: Put Vite middleware *before* the React Router handler in dev
//   app.use("*", ViteDevMiddleware({ viteDevServer }));
// }

// // 2. React Router Request Handler (Should be last for catch-all routing)

// // Function to get the build, mimicking the original getBuild structure
// async function getServerBuild(): Promise<ServerBuild> {
//   if (viteDevServer) {
//     // Dynamically import the dev build from Vite
//     const devBuild = await viteDevServer.ssrLoadModule(
//       "virtual:react-router/server-build", // or 'virtual:remix/server-build'
//     );
//     return devBuild as ServerBuild;
//   } else {
//     // Dynamically import the production build
//     // Use import.meta.resolve for robust path resolution relative to the current module
//     const buildPath = await import.meta.resolve("../build/server/index.js"); // Adjust relative path if needed
//     console.log(`Loading production build from: ${buildPath}`);
//     // Deno's dynamic import needs a file URL or absolute path
//     const prodBuild = await import(buildPath);
//     // Check if the default export exists, common in build outputs
//     return (prodBuild.default || prodBuild) as ServerBuild;
//   }
// }

// // Define Load Context function (Example)
// const getLoadContext = (c: Context): AppLoadContext => {
//   // Example: Extract data from request or environment
//   const clientIp = c.req.header("fly-client-ip") ||
//     c.req.header("x-forwarded-for")?.split(",")[0].trim() || "unknown";
//   return {
//     // Pass data needed by your loaders/actions
//     // db: getDbConnection(), // Example: get database connection
//     // user: await getUserFromSession(c), // Example: get user session
//     clientIp: clientIp,
//     // Add any other context derived from `c` or env vars
//   };
// };

// // Apply the React Router middleware
// app.use(
//   "*",
//   ReactRouterMiddleware({
//     mode: MODE,
//     build: getServerBuild(), // Pass the async function directly
//     getLoadContext: getLoadContext, // Pass your context function
//   }),
// );

// // --- Error Handling ---
// app.onError((err, c) => {
//   console.error(colors.red(`Unhandled application error:`), err);
//   // if (SENTRY_ENABLED) {
//   //   Sentry.captureException(err); // Capture error in Sentry
//   // }
//   return c.text("Internal Server Error", 500);
// });

// // --- Server Start and Graceful Shutdown ---
// const abortController = new AbortController();

// const serverPromise = Deno.serve(
//   {
//     port: PORT,
//     signal: abortController.signal, // Link server lifecycle to abort controller
//     onListen: ({ hostname, port }) => {
//       console.log(
//         colors.bold(
//           colors.green(`🚀 Server listening on http://${hostname}:${port}`),
//         ),
//       );
//       // Try to find local network IP (similar to original code)
//       try {
//         const netInterfaces = Deno.networkInterfaces();
//         let lanUrl: string | null = null;
//         for (const iface of netInterfaces) {
//           if (!iface.address || iface.internal || iface.family !== "IPv4") {
//             continue;
//           }
//           const ip = iface.address;
//           // Basic private IP check
//           if (
//             /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(ip)
//           ) {
//             lanUrl = `http://${ip}:${port}`;
//             break;
//           }
//         }
//         console.log(
//           `
// ${colors.bold("Local:")}         ${colors.cyan(`http://localhost:${port}`)}
// ${lanUrl ? `${colors.bold("On Your Network:")} ${colors.cyan(lanUrl)}` : ""}
// ${colors.bold("Press Ctrl+C to stop")}
//               `.trim(),
//         );
//       } catch (e) {
//         console.warn(
//           colors.yellow("Could not determine network IP:"),
//           e.message,
//         );
//         console.log(
//           colors.bold("Local:"),
//           colors.cyan(`http://localhost:${port}`),
//         );
//       }
//     },
//   },
//   app.fetch, // Use Hono's fetch handler
// ).finished; // Get promise that resolves when server closes

// // Handle SIGINT (Ctrl+C) and SIGTERM
// const handleShutdown = (signal: Deno.Signal) => {
//   console.log(
//     colors.yellow(`\nReceived signal: ${signal}. Shutting down gracefully...`),
//   );
//   abortController.abort(); // Signal Deno.serve to stop accepting new connections
// };

// Deno.addSignalListener("SIGINT", () => handleShutdown("SIGINT"));
// // Deno.addSignalListener("SIGTERM", () => handleShutdown("SIGTERM"));

// // Wait for server to close
// try {
//   await serverPromise;
//   console.log(colors.green("Server closed cleanly."));
// } catch (e) {
//   // AbortErrors are expected during shutdown, others are not
//   if (!(e instanceof Deno.errors.AbortError)) {
//     console.error(colors.red("Error during server shutdown:"), e);
//     Deno.exit(1); // Exit with error code if shutdown wasn't clean due to other error
//   } else {
//     console.log(colors.yellow("Server shutdown initiated by signal."));
//   }
// }

// // Optionally: Add Sentry flushing here if needed before exiting
// // if (SENTRY_ENABLED) {
// //    await Sentry.flush(2000); // Wait max 2 seconds for events to send
// //    console.log(colors.dim("Sentry events flushed."));
// // }

// Deno.exit(0); // Exit cleanly

// --------------------------------------------------------------------------------------------

// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import { type Context, Hono } from "hono"; // Import Context type
// import { serveStatic } from "hono/deno";
// import { compress } from "hono/compress";
// import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers";
// // import { sentry } from "@sentry/deno"; // Assuming Sentry Deno integration exists

// // Import the middleware and types from handlers.ts
// import { ReactRouterMiddleware } from "./handlers.ts";
// import type { MyLoadContext } from "./handlers.ts"; // Import your specific LoadContext type
// import type { AppLoadContext, ServerBuild } from "react-router";
// import type * as vite from "vite";

// // --- Environment Setup ---
// const MODE = Deno.env.get("NODE_ENV") === "development"
//   ? "development"
//   : "production";
// const IS_PROD = MODE === "production";
// const IS_DEV = MODE === "development";
// const ALLOW_INDEXING = Deno.env.get("ALLOW_INDEXING") !== "false";
// const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
// const SENTRY_ENABLED = IS_PROD && SENTRY_DSN;
// const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
// const HMR_PORT = parseInt(Deno.env.get("HMR_PORT") || "5173", 10); // Standard Vite port

// console.log(colors.cyan(`Running in ${MODE} mode.`));

// // --- Sentry Initialization (Conceptual) ---
// // if (SENTRY_ENABLED) { ... }

// // --- Vite Dev Server Setup (for SSR module loading) ---
// let viteDevServer: vite.ViteDevServer | undefined;
// if (IS_DEV) {
//   console.log(colors.yellow("Creating Vite server for SSR module loading..."));
//   // Ensure vite is a dev dependency
//   const vite = await import("vite");
//   viteDevServer = await vite.createServer({
//     server: {
//       middlewareMode: true, // Keep true even if not using middleware handler directly
//       // Explicitly set HMR port for clarity, esp if proxying
//       hmr: { port: HMR_PORT },
//     },
//     appType: "custom",
//   });
//   console.log(colors.green("Vite server instance created."));
//   console.warn(
//     colors.yellow(
//       `NOTE: Hono is NOT serving Vite assets directly. Run 'vite dev' separately and configure its proxy to point to http://localhost:${PORT}`,
//     ),
//   );
// }

// // --- Hono App Initialization ---
// const app = new Hono();

// // --- Core Middleware ---
// // [Keep Sentry, Logger, Compress, SecureHeaders, HTTPS Redirect, Trailing Slash, Rate Limiter (if implemented), Robots Tag middleware as before]
// // 1. Sentry (if enabled) ...
// // app.use("*", logger((str) => console.log(str)));
// // app.use("*", compress());
// // app.use("*", secureHeaders({/* ... options ... */}));
// // HTTPS Redirection ...
// app.use("*", async (c, next) => {
//   const proto = c.req.header("X-Forwarded-Proto");
//   if (!IS_DEV && proto === "http") { // Only redirect in production/staging
//     const host = c.req.header("X-Forwarded-Host") ?? c.req.header("host");
//     if (host) {
//       const url = new URL(c.req.url);
//       url.protocol = "https:";
//       url.host = host; // Use the forwarded host
//       console.log(`Redirecting HTTP to HTTPS: ${url.toString()}`);
//       return c.redirect(url.toString(), 301); // Use 301 for permanent redirect
//     }
//   }
//   await next();
// });
// // Trailing Slash Removal ...
// app.use("*", async (c, next) => {
//   const url = new URL(c.req.url);
//   if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
//     url.pathname = url.pathname.slice(0, -1);
//     console.log(`Removing trailing slash: ${url.toString()}`);
//     return c.redirect(url.toString(), 301); // Use 301 or 308
//   }
//   await next();
// });
// // Rate Limiting Conceptual ...
// // Robots Tag ...
// if (!ALLOW_INDEXING) {
//   app.use("*", async (c, next) => {
//     c.header("X-Robots-Tag", "noindex, nofollow");
//     await next();
//   });
//   console.log(
//     colors.yellow("Search engine indexing disabled via X-Robots-Tag."),
//   );
// }

// // --- Static File Serving ---
// // Serve build assets with immutable cache (PROD ONLY)
// if (IS_PROD) {
//   const clientBuildDir = path.join(Deno.cwd(), "build", "client");
//   // Serve /assets/* with long cache
//   app.use(
//     "/assets/*",
//     serveStatic({
//       root: clientBuildDir, // Serve from build/client
//       // No rewrite needed if root is build/client and request is /assets/*
//       onNotFound: (path, c) => {
//         console.warn(`Prod asset not found: ${path}`);
//         return c.notFound();
//       },
//     }),
//     async (c, next) => { // Add immutable cache headers AFTER serveStatic finds the file
//       // Check if response is already set and successful before setting header
//       if (c.res && c.res.ok) {
//         c.header("Cache-Control", "public, max-age=31536000, immutable");
//       }
//       // next() might not be needed if serveStatic sends the response, but doesn't hurt
//       await next();
//     },
//   );

//   // Serve other files from build/client (favicon, etc.) with shorter cache (PROD ONLY)
//   app.use(
//     "*", // Use '*' AFTER specific /assets/* route
//     serveStatic({
//       root: clientBuildDir,
//       // Let it fall through to React Router if not found
//       // `serveStatic` should call `next()` implicitly if file not found
//     }),
//     async (c, next) => { // Add cache header AFTER serveStatic finds file
//       if (c.res && c.res.ok && !c.req.path.startsWith("/assets/")) { // Only cache non-asset statics here
//         c.header("Cache-Control", "public, max-age=3600"); // 1 hour
//       }
//       await next(); // Crucial: ensure request continues to React Router if static file not found
//     },
//   );
// } else {
//   // Development: Serve static files from 'public' directory
//   // These will be overridden by Vite proxy for files Vite handles (like src/*)
//   const publicDir = path.join(Deno.cwd(), "public");
//   console.log(
//     colors.cyan(`Serving static files from: ${publicDir} (dev mode)`),
//   );
//   app.use(
//     "*",
//     serveStatic({
//       root: "./public", // Relative path is ok
//       // Allow fallthrough to React Router
//     }),
//     // No specific caching headers needed for /public in dev
//   );
// }

// // --- Application Handlers ---

// // 1. Vite Development Middleware (REMOVED)
// // if (IS_DEV && viteDevServer) {
// //   // app.use("*", ViteDevMiddleware({ viteDevServer })); // REMOVED
// // }

// // 2. React Router Request Handler (Should be the LAST middleware handling routes)

// // Function to get the server build
// async function getServerBuild(): Promise<ServerBuild> {
//   if (viteDevServer) {
//     console.log("Loading development build via Vite SSR...");
//     // Ensure the entry point matches your project structure (e.g., virtual:remix/server-build, ./server.ts)
//     const entryPoint = "virtual:react-router/server-build"; // Adjust if necessary
//     try {
//       const devBuild = await viteDevServer.ssrLoadModule(entryPoint);
//       console.log("Development build loaded.");
//       return devBuild as ServerBuild; // Assuming default export is the build
//     } catch (error) {
//       console.error(
//         colors.red(`Failed to load dev build from Vite (${entryPoint}):`),
//         error,
//       );
//       throw error; // Re-throw to prevent server starting with bad build
//     }
//   } else {
//     // Production: Load static build
//     // Use import.meta.resolve for robust path relative to *this* file
//     const buildPath = await import.meta.resolve("../build/server/index.js"); // Adjust if server/index.ts is elsewhere
//     console.log(`Loading production build from: ${buildPath}`);
//     try {
//       const prodBuild = await import(buildPath);
//       // CommonJS builds might export via `default` or directly
//       return (prodBuild.default || prodBuild) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(`Failed to load production build from ${buildPath}:`),
//         error,
//       );
//       throw error;
//     }
//   }
// }

// // Define Load Context function
// const getLoadContext = (c: Context): MyLoadContext => {
//   const clientIp = c.req.header("fly-client-ip") ||
//     c.req.header("x-forwarded-for")?.split(",")[0].trim() || "unknown";
//   // Add any other context data needed by loaders/actions
//   return {
//     clientIp: clientIp,
//     // Example: db: databaseConnectionInstance,
//   };
// };

// // Apply the React Router middleware - Place it *after* static file middleware
// // but before the final notFound/error handlers.
// app.use(
//   "*", // Handle all paths not caught by static file middleware
//   ReactRouterMiddleware({
//     mode: MODE,
//     // Pass the async function directly; the middleware will await it
//     build: getServerBuild(),
//     getLoadContext: getLoadContext,
//   }),
// );

// // --- Error Handling ---
// app.onError((err, c) => {
//   console.error(colors.red(`Unhandled Hono error:`), err);
//   // if (SENTRY_ENABLED && !(err instanceof Response)) { // Don't report thrown Responses
//   //   Sentry.captureException(err);
//   // }
//   // If the error is a Response (e.g., redirect thrown from loader), return it
//   if (err instanceof Response) {
//     return err;
//   }
//   return c.text("Internal Server Error", 500);
// });

// // --- Not Found Handler (Implicit in Hono unless defined) ---
// // If ReactRouterMiddleware doesn't match a route, it might return a 404 response.
// // If it throws or doesn't handle, Hono's default 404 runs.
// // You could add an explicit app.notFound here if needed.
// // app.notFound((c) => c.text('Custom Not Found', 404));

// // --- Server Start and Graceful Shutdown ---
// // [Keep server start and graceful shutdown logic as before]
// const abortController = new AbortController();

// // ... (rest of the server start, network interface logging, shutdown handling) ...

// console.log(`Preparing to serve on port ${PORT}...`);

// const server = Deno.serve(
//   {
//     port: PORT,
//     signal: abortController.signal,
//     onListen: ({ hostname, port }) => {
//       // ... console logs for local/network URLs ...
//       console.log(
//         colors.bold(
//           colors.green(`🚀 Server listening on http://localhost:${port}`), // Use localhost for clarity
//         ),
//       );
//       // Try to find local network IP
//       try {
//         /* ... network interface logic ... */
//       } catch (e) { /* ... error handling ... */ }

//       if (IS_DEV) {
//         console.log(
//           colors.cyan(
//             `   Vite HMR Port: ${HMR_PORT} (Ensure 'vite dev' is running)`,
//           ),
//         );
//       }
//     },
//   },
//   app.fetch, // Use Hono's fetch handler
// );

// const serverPromise = server.finished;

// const handleShutdown = (signal: Deno.Signal) => {
//   console.log(
//     colors.yellow(`\nReceived signal: ${signal}. Shutting down gracefully...`),
//   );
//   abortController.abort(); // Signal Deno.serve to stop
//   // Optionally close Vite server if running integrated (though we removed direct middleware)
//   if (viteDevServer) {
//     console.log(colors.magenta("Closing Vite dev server..."));
//     viteDevServer.close().catch((err) =>
//       console.error("Error closing Vite server:", err)
//     );
//   }
// };

// Deno.addSignalListener("SIGINT", () => handleShutdown("SIGINT"));
// // Deno.addSignalListener("SIGTERM", () => handleShutdown("SIGTERM")); // Uncomment if needed

// // Wait for server to close
// try {
//   await serverPromise;
//   console.log(colors.green("Server closed cleanly."));
// } catch (e) {
//   if (!(e instanceof Deno.errors.Interrupted)) { // AbortError is expected on shutdown
//     console.error(colors.red("Error during server shutdown:"), e);
//     Deno.exit(1);
//   } else {
//     console.log(colors.yellow("Server shutdown initiated by signal."));
//   }
// }

// // Optional: Sentry flush
// // if (SENTRY_ENABLED) { ... }

// Deno.exit(0);

// --------------------------------------------------------------------------------------------

// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import { type Context, Hono } from "hono";
// import { serveStatic } from "hono/deno";
// import { compress } from "hono/compress";
// import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers";
// // import { sentry } from "@sentry/deno"; // Placeholder: Import if using Sentry Deno SDK
// // import { rateLimiter } from 'hono-rate-limiter'; // Placeholder: Import if using a rate limiter

// import { ReactRouterMiddleware } from "./handlers.ts"; // Assuming handlers.ts is in the same directory
// import type { MyLoadContext } from "./handlers.ts"; // Import your specific LoadContext type
// import type { AppLoadContext, ServerBuild } from "react-router";
// import type * as vite from "vite";

// // --- Environment Setup ---
// const MODE = Deno.env.get("NODE_ENV") === "development"
//   ? "development"
//   : "production";
// const IS_PROD = MODE === "production";
// const IS_DEV = MODE === "development";
// const ALLOW_INDEXING = Deno.env.get("ALLOW_INDEXING") !== "false";
// const SENTRY_DSN = Deno.env.get("SENTRY_DSN"); // Replace with your Sentry DSN if used
// const SENTRY_ENABLED = IS_PROD && SENTRY_DSN;
// const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
// const HMR_PORT = parseInt(Deno.env.get("HMR_PORT") || "5173", 10); // Standard Vite HMR port

// console.log(colors.cyan(`Running in ${MODE} mode.`));

// // --- Sentry Initialization (Conceptual) ---
// // if (SENTRY_ENABLED) {
// //   sentry({ dsn: SENTRY_DSN /* ... other options */ });
// //   console.log(colors.green("Sentry initialized."));
// //   // Consider adding Sentry request handler middleware later
// // }

// // --- Vite Dev Server Setup (for SSR module loading ONLY) ---
// let viteDevServer: vite.ViteDevServer | undefined;
// if (IS_DEV) {
//   try {
//     console.log(
//       colors.yellow("Creating Vite server instance for SSR module loading..."),
//     );
//     const vite = await import("vite"); // Ensure vite is a dev dependency
//     viteDevServer = await vite.createServer({
//       server: {
//         middlewareMode: true, // Still useful for API structure even if not using middleware handler directly
//         // Define HMR port for clarity, although Hono doesn't handle HMR directly here
//         hmr: { port: HMR_PORT },
//       },
//       appType: "custom", // Important for manual integration
//     });
//     console.log(colors.green("Vite server instance created for SSR loading."));
//     console.warn(
//       colors.bold(
//         colors.yellow(
//           `\n🔔 IMPORTANT: Run 'vite dev' or your Vite development script in a SEPARATE terminal.\n   Configure 'vite.config.ts' server.proxy to forward requests (e.g., '/', '/api/*') to http://localhost:${PORT}\n`,
//         ),
//       ),
//     );
//   } catch (e) {
//     console.error(
//       colors.red("Failed to create Vite server instance:"),
//       e.message,
//     );
//     console.error(
//       colors.red("Ensure 'vite' is installed as a dev dependency."),
//     );
//     viteDevServer = undefined; // Ensure it's undefined if creation fails
//   }
// }

// // --- Hono App Initialization ---
// const app = new Hono();

// // --- Core Middleware (ORDER MATTERS!) ---

// // 1. Sentry Request Handler (If using Sentry)
// // if (SENTRY_ENABLED) {
// //    app.use('*', Sentry.Handlers.requestHandler());
// //    // Add Sentry tracing handler if needed
// // }

// // 2. Logger (Consider skipping assets/healthcheck in production)
// app.use("*", logger((str, ...rest) => console.log(str, ...rest)));

// // 3. Compression
// app.use("*", compress());

// // 4. Secure Headers (Helmet equivalent)
// app.use(
//   "*",
//   secureHeaders({
//     xPoweredBy: false, // Disable X-Powered-By
//     // Customize other headers as needed (CSP requires careful setup)
//     // referrerPolicy: "strict-origin-when-cross-origin",
//     // xFrameOptions: "DENY",
//     // xContentTypeOptions: "nosniff",
//     // strictTransportSecurity: IS_PROD ? "max-age=31536000; includeSubDomains; preload" : undefined, // Enable HSTS in prod only behind HTTPS proxy
//     // contentSecurityPolicy: { /* ...CSP directives... */ }, // Add CSP if needed
//   }),
// );

// // 5. HTTPS Redirection (Assuming Fly.io or similar proxy using X-Forwarded-Proto)
// //    Place *before* static files and router if you want *all* traffic redirected.
// app.use("*", async (c, next) => {
//   if (IS_PROD) { // Only enforce in production
//     const proto = c.req.header("X-Forwarded-Proto");
//     const host = c.req.header("X-Forwarded-Host") ?? c.req.header("host");
//     if (proto === "http" && host) {
//       const url = new URL(c.req.url);
//       url.protocol = "https:";
//       url.host = host; // Use the forwarded host
//       console.log(
//         colors.yellow(`Redirecting HTTP to HTTPS: ${url.toString()}`),
//       );
//       return c.redirect(url.toString(), 301); // Use 301 for permanent redirect
//     }
//   }
//   await next();
// });

// // 6. Trailing Slash Removal (Optional, for SEO consistency)
// app.use("*", async (c, next) => {
//   const url = new URL(c.req.url);
//   if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
//     url.pathname = url.pathname.slice(0, -1);
//     // Preserve search params
//     console.log(
//       colors.yellow(`Removing trailing slash: ${url.toString()}`),
//     );
//     return c.redirect(url.toString(), 301); // 301 or 308 (preserves method)
//   }
//   await next();
// });

// // 7. Rate Limiting (Placeholder - Implement with a library or custom logic)
// /*
// const generalRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 1000 }); // Example limits
// const strongRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 100 });
// const strongestRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 10 });
// const strongPaths = ['/login', '/signup', '/verify', '/reset-password', /* ... add sensitive POST/PUT paths * /];

// app.use('*', async (c, next) => {
//     const method = c.req.method;
//     const path = new URL(c.req.url).pathname;

//     // Skip rate limiting for static assets in production for performance
//     if (IS_PROD && (path.startsWith('/assets/') || path.endsWith('.ico') || path.endsWith('.png'))) {
//         return next();
//     }

//     let limiter = generalRateLimit; // Default

//     if (method !== 'GET' && method !== 'HEAD') {
//         limiter = strongPaths.some(p => path.includes(p)) ? strongestRateLimit : strongRateLimit;
//     } else if (path.includes('/verify')) { // Special GET case for verification tokens
//         limiter = strongestRateLimit;
//     }

//     return limiter(c, next); // Apply the chosen limiter
// });
// */

// // 8. Robots Tag (If indexing is disallowed)
// if (!ALLOW_INDEXING) {
//   app.use("*", async (c, next) => {
//     c.header("X-Robots-Tag", "noindex, nofollow");
//     await next();
//   });
//   console.log(
//     colors.yellow("Search engine indexing disabled via X-Robots-Tag."),
//   );
// }

// // --- Static File Serving ---

// // In PRODUCTION: Serve built client assets
// if (IS_PROD) {
//   const clientBuildDir = path.join(Deno.cwd(), "build", "client");
//   console.log(
//     colors.cyan(`Serving production static files from: ${clientBuildDir}`),
//   );

//   // Serve /assets/* with immutable caching (hashed filenames)
//   app.use(
//     "/assets/*",
//     serveStatic({
//       root: clientBuildDir, // Root is build/client
//       onNotFound: (path, c) => {
//         console.warn(colors.yellow(`Prod asset not found: ${path}`));
//         // Do NOT call next() here, let serveStatic handle the 404 for assets
//         return c.notFound();
//       },
//     }),
//     // Add Cache-Control *after* the file is found by serveStatic
//     async (c, next) => {
//       if (c.res.ok) { // Check if serveStatic successfully set a response
//         c.header("Cache-Control", "public, max-age=31536000, immutable");
//       }
//       // No need to call next() if serveStatic responded.
//       // If you needed fallthrough *after* caching, you would call await next().
//     },
//   );

//   // Serve other files from build/client (e.g., favicon.ico, manifest.json) with shorter cache
//   // This needs to allow fallthrough to the React Router handler if file not found.
//   app.use(
//     "*", // Catches everything not handled by /assets/*
//     serveStatic({
//       root: clientBuildDir,
//       // serveStatic calls next() internally if file not found, allowing fallthrough
//     }),
//     // Add Cache-Control *after* the file is found
//     async (c, next) => {
//       if (c.res.ok) { // Check if serveStatic found a file and responded
//         c.header("Cache-Control", "public, max-age=3600"); // 1 hour cache
//         // Do not call next() here, response is sent.
//       } else {
//         // If serveStatic didn't find the file, c.res won't be OK.
//         // We MUST call next() to pass the request to React Router.
//         await next();
//       }
//     },
//   );
// } else {
//   // In DEVELOPMENT: Serve files from the 'public' directory.
//   // Vite's dev server (running separately) will handle most assets via proxy.
//   // This is for files *not* processed by Vite (e.g., public/robots.txt).
//   const publicDir = path.join(Deno.cwd(), "public");
//   console.log(
//     colors.cyan(`Serving static files from: ${publicDir} (dev mode)`),
//   );
//   app.use(
//     "*",
//     serveStatic({
//       root: "./public", // Relative to CWD
//       // Allow fallthrough to React Router by default if file not found
//     }),
//     // No cache headers needed for /public in dev
//     // Must call next() if serveStatic didn't find a file
//     async (_c, next) => {
//       await next();
//     },
//   );
// }

// // --- Application Handlers ---

// // NOTE: No ViteDevMiddleware here. Integration is via separate `vite dev` process + proxy.

// // Function to reliably get the server build
// async function getServerBuild(): Promise<ServerBuild> {
//   if (IS_DEV && viteDevServer) {
//     console.log(colors.magenta("Loading development build via Vite SSR..."));
//     try {
//       // Adjust 'virtual:react-router/server-build' if your entry is different
//       // Could also be './src/entry.server.ts' depending on your setup
//       const entryPoint = "virtual:react-router/server-build";
//       const devBuild = await viteDevServer.ssrLoadModule(entryPoint, {
//         fixStacktrace: true, // Useful for debugging SSR errors
//       });
//       console.log(colors.magenta("Development build loaded successfully."));
//       // Remix/React Router builds often export the build as default
//       return (devBuild.default || devBuild) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(`❌ Failed to load dev build from Vite (${error.message})`),
//       );
//       // Log the full error and potentially the stack trace from the error object
//       console.error(error.stack || error);
//       throw new Error("Failed to load development server build."); // Throw to prevent proceeding
//     }
//   } else {
//     // Production: Load static build
//     const buildPathRel = "../build/server/index.js"; // Relative path from *this* file
//     let buildPath: string;
//     try {
//       // Use import.meta.resolve for robust path finding relative to the current module
//       buildPath = await import.meta.resolve(buildPathRel);
//       console.log(`Loading production build from: ${buildPath}`);
//       const prodBuild = await import(buildPath);
//       return (prodBuild.default || prodBuild) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(
//           `❌ Failed to load production build (tried ${buildPathRel}): ${error.message}`,
//         ),
//       );
//       console.error(error.stack || error);
//       throw new Error("Failed to load production server build.");
//     }
//   }
// }

// // Define Load Context function (customize as needed)
// const getLoadContext = (c: Context): MyLoadContext => {
//   // Extract info from request headers (trust appropriate headers based on proxy setup)
//   const clientIp = c.req.header("fly-client-ip") || // Specific to Fly.io
//     c.req.header("x-forwarded-for")?.split(",")[0].trim() || // Standard proxy header
//     c.env?.remoteAddr?.hostname || // Deno.serve built-in (might be internal Docker IP)
//     "unknown";

//   // Add other context data needed by your React Router loaders/actions
//   return {
//     clientIp: clientIp,
//     // exampleDb: getDbConnection(), // Get DB connection/pool
//     // exampleUser: await getUserFromSession(c), // Get user session data
//   };
// };

// // React Router Request Handler (Should be the LAST route-handling middleware)
// app.use(
//   "*", // Handle all requests not caught by static middleware
//   ReactRouterMiddleware({
//     mode: MODE,
//     // Pass the async function; the middleware will await it
//     build: getServerBuild(),
//     getLoadContext: getLoadContext,
//   }),
// );

// // --- Error Handling ---

// // Sentry Error Handler (if using Sentry, place before default Hono error handler)
// // if (SENTRY_ENABLED) {
// //    app.use('*', Sentry.Handlers.errorHandler());
// // }

// // Hono's Default Error Handler
// app.onError((err, c) => {
//   console.error(colors.red(`\n--- Hono Application Error ---`));
//   console.error(err); // Log the full error object
//   console.error(colors.red(`--- End Error ---`));

//   // Send error to Sentry if it's enabled and not a Response object
//   // if (SENTRY_ENABLED && !(err instanceof Response)) {
//   //   try {
//   //     Sentry.captureException(err);
//   //   } catch (sentryErr) {
//   //     console.error(colors.magenta("Failed to capture exception in Sentry:"), sentryErr);
//   //   }
//   // }

//   // If the error is a Response (e.g., redirect thrown from loader/action), return it
//   if (err instanceof Response) {
//     return err;
//   }

//   // Otherwise, return a generic 500 response
//   return c.text("Internal Server Error", 500);
// });

// // Explicit 404 Not Found Handler (Optional - React Router usually handles this)
// // Useful if some requests might bypass React Router entirely but aren't caught by static handlers.
// // app.notFound((c) => {
// //   console.warn(`404 Not Found: ${c.req.url}`);
// //   return c.text('Not Found', 404);
// // });

// // --- Server Start and Graceful Shutdown ---
// const abortController = new AbortController();

// console.log(`Preparing to serve on port ${PORT}...`);

// const server = Deno.serve(
//   {
//     port: PORT,
//     signal: abortController.signal, // Link server lifecycle to abort controller
//     onListen: ({ hostname, port }) => {
//       const localUrl = `http://localhost:${port}`; // Use localhost for clarity
//       console.log(
//         colors.bold(colors.green(`🚀 Server listening on ${localUrl}`)),
//       );

//       // Try to find local network IP (useful for testing on mobile devices)
//       let lanUrl: string | null = null;
//       try {
//         const netInterfaces = Deno.networkInterfaces();
//         for (const iface of netInterfaces) {
//           if (
//             !iface.address || iface.internal || iface.family !== "IPv4" ||
//             iface.address.startsWith("169.254") // Skip link-local
//           ) {
//             continue;
//           }
//           const ip = iface.address;
//           // Basic private IP check (adjust if using different ranges)
//           if (
//             /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(ip)
//           ) {
//             lanUrl = `http://${ip}:${port}`;
//             break; // Use the first private IP found
//           }
//         }
//       } catch (e) {
//         console.warn(
//           colors.yellow("Could not determine network IP:"),
//           e.message,
//         );
//       }

//       console.log(
//         `
// ${colors.bold("Mode:")}           ${MODE}
// ${colors.bold("Local:")}         ${colors.cyan(localUrl)}
// ${lanUrl ? `${colors.bold("On Network:")}   ${colors.cyan(lanUrl)}` : ""}
// ${
//           IS_DEV
//             ? colors.yellow(
//               `Vite HMR:       (Handled by separate 'vite dev' process on port ${HMR_PORT})`,
//             )
//             : ""
//         }
// ${colors.bold("Press Ctrl+C to stop")}
//         `.trim(),
//       );
//     },
//     // Add Hono's fetch handler error handling
//     onError: (error) => {
//       console.error(colors.red("Deno.serve uncaught error:"), error);
//       // Potentially capture in Sentry here as well for low-level errors
//       return new Response("Internal Server Error", { status: 500 });
//     },
//   },
//   app.fetch, // Use Hono's fetch handler
// );

// const serverPromise = server.finished; // Promise resolving when server stops

// // Graceful shutdown handler
// const handleShutdown = async (signal: Deno.Signal) => {
//   console.log(
//     colors.yellow(`\nReceived signal: ${signal}. Shutting down gracefully...`),
//   );
//   abortController.abort(); // Signal Deno.serve to stop accepting new connections

//   // Close Vite server instance if it was created
//   if (viteDevServer) {
//     console.log(colors.magenta("Closing Vite dev server instance..."));
//     await viteDevServer.close().catch((err) =>
//       console.error("Error closing Vite server:", err)
//     );
//   }

//   // Optional: Add delays or wait for ongoing requests if necessary
//   // await Promise.allSettled([ /* promises for ongoing operations */ ]);

//   // Sentry flush before exit (if using Sentry)
//   // if (SENTRY_ENABLED) {
//   //   console.log(colors.dim("Flushing Sentry events..."));
//   //   const flushed = await Sentry.close(2000); // Wait max 2 seconds
//   //   if (!flushed) {
//   //     console.warn(colors.yellow("Sentry flush timed out."));
//   //   } else {
//   //     console.log(colors.dim("Sentry events flushed."));
//   //   }
//   // }
// };

// // Listen for shutdown signals
// Deno.addSignalListener("SIGINT", () => handleShutdown("SIGINT"));
// // Deno.addSignalListener("SIGTERM", () => handleShutdown("SIGTERM")); // Uncomment if deploying in containers that send SIGTERM

// // Wait for the server to close
// try {
//   await serverPromise;
//   console.log(colors.green("Server closed cleanly."));
// } catch (e) {
//   // Deno.errors.Interrupted is expected during graceful shutdown via AbortController
//   if (!(e instanceof Deno.errors.Interrupted)) {
//     console.error(colors.red("Error during server shutdown:"), e);
//     Deno.exit(1); // Exit with error code if shutdown failed unexpectedly
//   } else {
//     console.log(colors.yellow("Server shutdown initiated by signal."));
//   }
// }

// Deno.exit(0); // Exit cleanly

// --------------------------------------------------------------------------------------------
// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import { Hono } from "hono";
// import type { Context } from "hono"; // Import Context type
// import { serveStatic } from "hono/deno";
// import { compress } from "hono/compress";
// import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers";
// // import { sentry } from "@sentry/deno"; // Placeholder: If/when Sentry Deno integration exists

// // Import your React Router middleware and types
// import { ReactRouterMiddleware } from "./handlers.ts";
// import type { MyLoadContext } from "./handlers.ts"; // Your specific LoadContext type

// // Import React Router server types
// import type { ServerBuild } from "react-router";

// // Import Vite types for dev server interaction
// import type * as vite from "vite";

// // --- Environment Setup ---
// const MODE = Deno.env.get("NODE_ENV") === "development"
//   ? "development"
//   : "production";
// const IS_PROD = MODE === "production";
// const IS_DEV = MODE === "development";
// const ALLOW_INDEXING = Deno.env.get("ALLOW_INDEXING") !== "false";
// const SENTRY_DSN = Deno.env.get("SENTRY_DSN");
// const SENTRY_ENABLED = IS_PROD && SENTRY_DSN;
// const PORT = parseInt(Deno.env.get("PORT") || "3000", 10);
// // Vite HMR port - Ensure this matches your `vite.config.ts` if specified
// const HMR_PORT = parseInt(Deno.env.get("HMR_PORT") || "5173", 10);

// console.log(colors.cyan(`Running in ${MODE} mode.`));

// // --- Sentry Initialization (Conceptual) ---
// // if (SENTRY_ENABLED) {
// //   try {
// //     sentry({ dsn: SENTRY_DSN /* ... other options */ });
// //     console.log(colors.green("Sentry initialized (conceptual)."));
// //   } catch (e) { console.error("Sentry init failed:", e)}
// // }

// // --- Vite Dev Server Instance (for SSR module loading ONLY) ---
// let viteDevServer: vite.ViteDevServer | undefined;
// if (IS_DEV) {
//   try {
//     console.log(
//       colors.yellow("Creating Vite server instance for SSR module loading..."),
//     );
//     // Dynamically import Vite only in development
//     const vite = await import("npm:vite"); // Make sure vite is in devDependencies / import map
//     viteDevServer = await vite.createServer({
//       server: {
//         middlewareMode: true, // Still useful for `ssrLoadModule`
//         // Inform Vite it won't be serving HTML directly
//         hmr: { port: HMR_PORT }, // Explicitly set HMR port
//       },
//       appType: "custom", // Important: We handle the main server logic
//     });
//     console.log(colors.green("Vite server instance created."));
//     console.warn(
//       colors.yellow(
//         `IMPORTANT: This Hono server does NOT serve Vite's dev assets directly.
// Run 'vite dev' in a separate terminal. Configure 'vite.config.ts' server.proxy
// to forward application requests (e.g., '/', '/api') to http://localhost:${PORT}`,
//       ),
//     );
//   } catch (e) {
//     console.error(colors.red("Failed to create Vite server instance:"), e);
//     console.error(
//       colors.red(
//         "Ensure 'vite' is installed (`deno add npm:vite`) and runnable.",
//       ),
//     );
//     viteDevServer = undefined; // Ensure it's undefined on failure
//   }
// }

// // --- Hono App Initialization ---
// const app = new Hono();

// // --- Core Middleware (Order Matters!) ---

// // 1. Logger (Consider skipping health checks or static assets if desired)
// app.use("*", logger((str, ...rest) => console.log(str, ...rest))); // Customize formatting as needed

// // 2. Sentry Request Handler (Conceptual - Add EARLY if using)
// // if (SENTRY_ENABLED) { app.use('*', sentryRequestHandler()); }

// // 3. Compression
// app.use("*", compress());

// // 4. Secure Headers (Helmet equivalent)
// app.use(
//   "*",
//   secureHeaders({
//     xPoweredBy: false,
//     referrerPolicy: "strict-origin-when-cross-origin", // Sensible default
//     // Add other headers as needed, e.g.:
//     // contentSecurityPolicy: { ... } // CSP is complex, configure carefully
//     // strictTransportSecurity: 'max-age=...', // HSTS - enable only if using HTTPS reliably
//   }),
// );

// // 5. HTTPS Redirection (If behind a proxy like Fly.io that sets X-Forwarded-Proto)
// app.use("*", async (c, next) => {
//   if (IS_PROD) { // Only redirect in production
//     const proto = c.req.header("X-Forwarded-Proto");
//     const host = c.req.header("X-Forwarded-Host") ?? c.req.header("host"); // Get host header
//     if (proto === "http" && host) {
//       const url = new URL(c.req.url);
//       url.protocol = "https:";
//       url.host = host; // Use the forwarded host
//       console.log(
//         colors.yellow(`Redirecting HTTP to HTTPS: ${url.toString()}`),
//       );
//       return c.redirect(url.toString(), 301); // 301 Permanent Redirect
//     }
//   }
//   await next();
// });

// // 6. Trailing Slash Removal (for SEO consistency)
// app.use("*", async (c, next) => {
//   const url = new URL(c.req.url);
//   if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
//     url.pathname = url.pathname.slice(0, -1);
//     // Preserve search parameters
//     const newUrl = url.pathname + url.search;
//     console.log(
//       colors.yellow(`Removing trailing slash: ${c.req.url} -> ${newUrl}`),
//     );
//     // Use 301 or 308 (Permanent, Preserve Method)
//     return c.redirect(newUrl, 301);
//   }
//   await next();
// });

// // 7. Rate Limiting (Placeholder - Requires implementation or library)
// // const generalRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 1000 });
// // const strongRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 100 });
// // const strongestRateLimit = createRateLimiter({ windowMs: 60 * 1000, limit: 10 });
// // const strongPaths = [ /* ... paths from original code ... */];
// // app.use('*', async (c, next) => {
// //    // Apply rate limiting logic based on path/method
// //    // Remember to call the correct limiter (e.g., strongestRateLimit(c, next))
// //    await next(); // Fallback or call generalRateLimit
// // });

// // 8. Robots Tag (Prevent indexing if disallowed)
// if (!ALLOW_INDEXING) {
//   app.use("*", async (c, next) => {
//     c.header("X-Robots-Tag", "noindex, nofollow");
//     await next();
//   });
//   console.log(
//     colors.yellow("Search engine indexing disabled via X-Robots-Tag."),
//   );
// }

// // --- Static File Serving ---

// if (IS_PROD) {
//   // Production: Serve from 'build/client'
//   const clientBuildDir = path.resolve(Deno.cwd(), "build", "client"); // Use absolute path
//   console.log(
//     colors.cyan(`Serving production static files from: ${clientBuildDir}`),
//   );

//   // a) Serve immutable assets (`/assets/*`) with long cache
//   app.use(
//     "/assets/*",
//     async (c, next) => {
//       // Set Cache-Control *before* serveStatic attempts to serve the file.
//       // This ensures the header is set even if serveStatic sends 304 Not Modified.
//       c.header("Cache-Control", "public, max-age=31536000, immutable");
//       await next();
//     },
//     serveStatic({
//       root: clientBuildDir, // Serve assets relative to this root
//       // Note: serveStatic root doesn't include `/assets` here
//       onNotFound: (path, c) => {
//         console.warn(`Production asset not found: ${path}`);
//         // Do NOT call next() here, let Hono handle the 404 implicitly if file not found
//         // return c.notFound(); // Let Hono's default 404 run
//       },
//     }),
//   );

//   // b) Serve other static files (favicon.ico, etc.) from client root with shorter cache
//   // This MUST come AFTER /assets/* route and BEFORE the main React Router handler.
//   app.use(
//     "*", // Catch-all for files *not* under /assets
//     async (c, next) => {
//       // Check if the request path looks like a file (heuristic)
//       // Avoid setting cache headers for potential API routes handled by React Router
//       if (c.req.path.includes(".")) {
//         c.header("Cache-Control", "public, max-age=3600"); // 1 hour cache
//       }
//       await next();
//     },
//     serveStatic({
//       root: clientBuildDir,
//       // IMPORTANT: Let serveStatic call `next()` implicitly if file not found,
//       // so the request can fall through to the React Router handler.
//       // Don't define onNotFound to achieve this default behavior.
//     }),
//   );
// } else {
//   // Development: Serve files from 'public' directory.
//   // Vite's proxy should handle source files (.ts, .css, etc.) and HMR.
//   // This serves files like `favicon.ico` placed in `public/`.
//   const publicDir = path.resolve(Deno.cwd(), "public");
//   console.log(
//     colors.cyan(`Serving development static files from: ${publicDir}`),
//   );
//   app.use(
//     "*",
//     serveStatic({
//       root: "./public", // Relative path is usually fine here
//       // Allow fallthrough to React Router if not found
//     }),
//     // No specific caching needed for /public in dev
//   );
// }

// // --- React Router Application Handler ---
// // This should be the LAST route handler to act as a catch-all.

// // Function to get the server build (dynamic in dev, static in prod)
// async function getServerBuild(): Promise<ServerBuild> {
//   if (viteDevServer) {
//     // Development: Load fresh build from Vite on each request
//     console.log(colors.magenta("Loading DEV build via Vite..."));
//     try {
//       // Ensure the entry point matches your project structure/Vite config
//       const entryModule = "virtual:react-router/server-build"; // Or './server/entry.server.tsx' etc.
//       const buildModule = await viteDevServer.ssrLoadModule(entryModule, {
//         fixStacktrace: true, // Helpful for debugging SSR errors
//       });
//       console.log(colors.magenta("DEV build loaded successfully."));
//       // Remix builds often have a `default` export
//       return (buildModule.default || buildModule) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(`❌ Failed to load DEV build from Vite:`),
//         error,
//       );
//       // Re-throw to prevent serving with a broken build
//       throw error;
//     }
//   } else {
//     // Production: Load the static build once
//     // Use import.meta.resolve for robust path relative to *this* file
//     const buildPath = await import.meta.resolve("../build/server/index.js"); // Adjust path if needed
//     console.log(colors.cyan(`Loading PROD build from: ${buildPath}`));
//     try {
//       // Deno's dynamic import needs a file URL
//       const buildModule = await import(buildPath);
//       // Check for default export, common in build outputs
//       return (buildModule.default || buildModule) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(`❌ Failed to load PROD build from ${buildPath}:`),
//         error,
//       );
//       throw error;
//     }
//   }
// }

// // Apply the React Router middleware
// app.use(
//   "*", // Handle all requests not caught by static middleware
//   ReactRouterMiddleware({
//     // Pass the function; the middleware will call and await it
//     build: getServerBuild(),
//     mode: MODE,
//     // getLoadContext is defined in the middleware itself, but you could override it:
//     // getLoadContext: (c: Context): MyLoadContext => { ...custom logic... }
//   }),
// );

// // --- Error Handling ---
// app.onError((err, c) => {
//   console.error(colors.red(`🔥 Hono Server Error:`), err);
//   // Optional: Send to Sentry (ensure it doesn't report thrown Responses)
//   // if (SENTRY_ENABLED && !(err instanceof Response)) { Sentry.captureException(err); }

//   // If React Router threw a Response (e.g., redirect), let it pass through
//   if (err instanceof Response) {
//     return err;
//   }

//   // For other errors, return a generic 500
//   return c.text("Internal Server Error", 500);
// });

// // --- Default Not Found (Optional) ---
// // Hono provides a basic 404. If React Router handles routes correctly,
// // its own 404 component/route should render. You only need this if
// // requests somehow bypass React Router and aren't static files.
// // app.notFound((c) => c.text('Custom Top-Level Not Found', 404));

// // --- Server Start and Graceful Shutdown ---
// const abortController = new AbortController();

// console.log(colors.blue(`Attempting to start server on port ${PORT}...`));

// const server = Deno.serve(
//   {
//     port: PORT,
//     signal: abortController.signal, // Link server lifecycle to controller
//     onListen: ({ hostname, port }) => {
//       const localUrl = `http://localhost:${port}`; // Use localhost for clarity
//       console.log(
//         colors.bold(colors.green(`🚀 Server listening on ${localUrl}`)),
//       );

//       // Try to find local network IP (best effort)
//       try {
//         const netInterfaces = Deno.networkInterfaces();
//         let lanUrl: string | null = null;
//         for (const iface of netInterfaces) {
//           if (!iface.address || iface.internal || iface.family !== "IPv4") {
//             continue;
//           }
//           // Basic private IP check
//           if (
//             /^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(
//               iface.address,
//             )
//           ) {
//             lanUrl = `http://${iface.address}:${port}`;
//             break; // Found one
//           }
//         }
//         console.log(
//           `
// ${colors.bold("Local:")}            ${colors.cyan(localUrl)}
// ${lanUrl ? `${colors.bold("On Your Network:")}  ${colors.cyan(lanUrl)}` : ""}
// ${
//             IS_DEV
//               ? colors.magenta(
//                 `Vite HMR Port:      ${HMR_PORT} (Ensure 'vite dev' is running & proxying)`,
//               )
//               : ""
//           }
// ${colors.bold("Press Ctrl+C to stop")}
//           `.trim(),
//         );
//       } catch (e) {
//         // Don't crash if network interfaces fail
//         console.warn(
//           colors.yellow("Could not determine network IP:"),
//           e.message,
//         );
//         console.log(
//           `${colors.bold("Local:")}            ${colors.cyan(localUrl)}`,
//         );
//         if (IS_DEV) {
//           console.log(
//             colors.magenta(
//               `Vite HMR Port:      ${HMR_PORT} (Ensure 'vite dev' is running & proxying)`,
//             ),
//           );
//         }
//       }
//     },
//     // Hono's fetch handler processes requests
//   },
//   app.fetch,
// );

// const serverPromise = server.finished; // Promise that resolves when server closes

// // Handle SIGINT (Ctrl+C) and potentially SIGTERM
// const handleShutdown = async (signal: Deno.Signal) => {
//   console.log(
//     colors.yellow(`\nReceived signal: ${signal}. Shutting down gracefully...`),
//   );

//   // 1. Signal Deno.serve to stop accepting new connections
//   abortController.abort();

//   // 2. Close Vite dev server if it's running
//   if (viteDevServer) {
//     console.log(colors.magenta("Closing Vite dev server..."));
//     await viteDevServer.close().catch((err) =>
//       console.error("Error closing Vite:", err)
//     );
//     console.log(colors.magenta("Vite dev server closed."));
//   }

//   // 3. Optional: Add other cleanup tasks (e.g., close database connections)
//   // await closeDbConnections();

//   // 4. Wait briefly for server to finish processing existing requests (optional)
//   // await new Promise(resolve => setTimeout(resolve, 100)); // e.g., 100ms grace period

//   console.log(colors.yellow("Shutdown complete."));
// };

// // Deno.addSignalListener("SIGTERM", () => handleShutdown("SIGTERM")); // Add if needed for deployment env
// Deno.addSignalListener("SIGINT", () => handleShutdown("SIGINT"));

// // Wait for the server to close
// try {
//   await serverPromise;
//   console.log(colors.green("Server closed cleanly."));
// } catch (e) {
//   // Deno.errors.Interrupted is expected during controlled shutdown via AbortController
//   if (!(e instanceof Deno.errors.Interrupted)) {
//     console.error(colors.red("Error during server shutdown:"), e);
//     Deno.exit(1); // Exit with error code
//   } else {
//     console.log(colors.yellow("Server shutdown initiated by signal."));
//   }
// }

// // Optional: Flush Sentry events before exiting
// // if (SENTRY_ENABLED) {
// //    console.log(colors.dim("Flushing Sentry events..."));
// //    await Sentry.flush(2000); // Wait max 2 seconds
// //    console.log(colors.dim("Sentry events flushed."));
// // }

// Deno.exit(0); // Exit cleanly

// --------------------------------------------------------------------------------------------
import * as path from "jsr:@std/path";
import * as colors from "jsr:@std/fmt/colors";
import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { compress } from "hono/compress";
import { logger } from "hono/logger";
// import { secureHeaders } from "hono/secure-headers";
// import { upgradeWebSocket } from 'hono/deno'
// import { createMiddleware } from "hono/factory";
// import { createRequestHandler } from "react-router";
import type { AppLoadContext, ServerBuild } from "react-router";
import {
  createGetLoadContext,
  CWD,
  getBuildMode,
  type GetLoadContextFunction,
  importBuild,
} from "./helpers.ts";
import { ReactRouterMiddleware, ViteDevMiddleware } from "./handlers.ts";
import type { ViteDevServer } from "vite";

// const CWD = Deno.env.get("REACT_ROUTER_ROOT") ?? Deno.cwd();
const CLIENT_BUILD_DIR = path.resolve(CWD, "build", "client");
const ASSETS_DIR = "assets";
// console.log(colors.green(CLIENT_BUILD_DIR));

interface ServerOptions {
  port?: number;
  // fetch?: Deno.ServeOptions['signal']; // Allow overriding fetch
  getLoadContext?: GetLoadContextFunction;
  configure?: (app: Hono) => void | Promise<void>; // Hook for custom middleware
}

async function createServer(options: ServerOptions = {}) {
  const mode = getBuildMode();
  const IS_PROD = mode === "production";
  const port = options.port ?? Number(Deno.env.get("PORT") ?? 3000);

  const app = new Hono();

  // --- Vite Dev Server Setup ---
  let viteDevServer: ViteDevServer | undefined;
  if (!IS_PROD) {
    // const vite = await import("vite");
    // viteDevServer = await vite.createServer({
    //   server: { middlewareMode: true },
    //   // appType: "custom", // Important for controlling the HTML response
    //   // root: CWD, // Set root for resolving modules
    // });
    viteDevServer = await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
        // forceOptimizeDeps: true,
      })
    );
    console.log("✅ Vite Dev Server initialized.");
  }

  // --- Core Middleware ---
  // app.use(compress());
  app.use(logger());

  // --- Custom Middleware Hook ---
  // await options.configure?.(app);

  // --- Static Asset Serving ---
  app.use(
    `/${ASSETS_DIR}/*`,
    serveStatic({
      root: `./${path.relative(CWD, CLIENT_BUILD_DIR)}`, // Relative path for serveStatic
      // Optional: Add caching headers for production assets
      // middleware: IS_PROD ? [cache({ /* cache options */ })] : [],
    }),
  );
  // In prod, these might be in CLIENT_BUILD_DIR, in dev from ./public
  app.use(
    "*",
    serveStatic({
      root: IS_PROD ? `./${path.relative(CWD, CLIENT_BUILD_DIR)}` : "./public",
    }),
  );

  // --- API Routes (Example) ---
  // Place API routes *before* the React Router catch-all
  // app.get("/api/hello", (c) => c.json({ message: "Hello from Hono API!" }));

  // --- Vite Dev Middleware (Development only) ---
  // Add Vite middleware *before* the React Router handler if needed
  // This handles HMR, source maps, etc.
  if (!IS_PROD && viteDevServer) {
    // Option 1: Use the custom middleware (if it works reliably)
    // app.use("*", ViteDevMiddleware({ viteDevServer }));

    // Option 2: Simpler - Let Vite handle requests via its own server/ports
    // or rely on falling through if `middlewareMode` allows it.
    // For now, let's assume falling through might work for some assets,
    // but explicit middleware might be needed for full Vite features.
    // Let's *not* add it by default unless proven necessary.
    console.log(
      "ℹ️ Vite middleware integration skipped by default. Add if needed.",
    );
  }

  // --- React Router Request Handler ---
  const getLoadContext = createGetLoadContext(options.getLoadContext);

  //   app.use("*", async (c, next) => {
  //     const build = (await importDevBuild()) as any;
  //     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as any })(c, next);
  //     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as AppLoadContext })(c, next);
  //     return ReactRouterMiddleware({
  //       mode: "development",
  //       build,
  //       getLoadContext: (c) => {
  //         return {
  //           context: c,
  //           db: "db",
  //           nrs_test: "nrs_test_xxxx",
  //         };
  //       },
  //     })(c, next);
  //   });

  // app.use(
  //   "*",
  //   // ReactRouterMiddleware({
  //   //   build: importBuild(viteDevServer),
  //   //   mode,
  //   //   getLoadContext,
  //   // }),
  //   async (c, next) => {
  //     const build = await importBuild(viteDevServer);
  //     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as any })(c, next);
  //     // return RemixMiddleware({ mode: 'development', build, getLoadContext: (c) => c.env as AppLoadContext })(c, next);
  //     return ReactRouterMiddleware({
  //       mode: "development",
  //       build,
  //       getLoadContext,
  //     })(c, next);
  //   },
  //   // createMiddleware(async (c, next) => {
  //   //   try {
  //   //     // // Load the build for *each request* in dev to get HMR updates.
  //   //     // // `importBuild` handles caching/loading logic.
  //   //     // const build = await importBuild(viteDevServer);
  //   //     // const requestHandler = createRequestHandler(build, mode);
  //   //     // const loadContext = await getLoadContext(c);

  //   //     // // Ensure AppLoadContext has expected shape if needed by router/loaders
  //   //     // // const augmentedContext: AppLoadContext = {
  //   //     // //   ...loadContext,
  //   //     // //   // Add specific things if your app expects them
  //   //     // // };

  //   //     // return await requestHandler(c.req.raw, loadContext);

  //   //     const build = await importBuild(viteDevServer);
  //   //     // export interface ReactRouterMiddlewareOptions {
  //   //     //   build: ServerBuild | Promise<ServerBuild>; // Allow promise for dev build
  //   //     //   mode?: "development" | "production";
  //   //     //   getLoadContext?(c: Context): Promise<AppLoadContext> | AppLoadContext;
  //   //     // }
  //   //     //! Use the React Router middleware
  //   //     const loadContext = await getLoadContext(c);
  //   //     const buildMode = mode ?? getBuildMode();
  //   //     const options = {
  //   //       build,
  //   //       mode: buildMode,
  //   //       getLoadContext: () => loadContext,
  //   //     };
  //   //     const requestHandler = ReactRouterMiddleware(options);
  //   //     const response = await requestHandler(c.req.raw, loadContext);
  //   //     // If the response is a Response object, return it directly
  //   //     if (response instanceof Response) {
  //   //       return response;
  //   //     }

  //   //     // Otherwise, return a 500 error
  //   //     console.error("⛔️ React Router Middleware Error:", response);
  //   //     return c.text("Internal Server Error", 500);
  //   //   } catch (error) {
  //   //     // If build loading fails, return a 500
  //   //     if (error instanceof Error && error.message.includes("server build")) {
  //   //       console.error("⛔️ Server Build Error:", error);
  //   //       return c.text("Server Build Error", 500);
  //   //     }
  //   //     // Handle other errors during request handling
  //   //     console.error("⛔️ Request Handling Error:", error);
  //   //     // Optionally send error details in dev mode
  //   //     return c.text(
  //   //       `Internal Server Error: ${IS_PROD ? "" : error.message}`,
  //   //       500,
  //   //     );
  //   //   }
  //   // }),
  // );

  // --- Start Server ---
  console.log(
    `🚀 Server starting in ${mode} mode on http://localhost:${port}`,
  );
  // Deno.serve({
  //   port: port,
  //   fetch: app.fetch, // Use Hono's fetch handler
  //   // Add other Deno.ServeOptions if needed (e.g., hostname, onError)
  //   onError: (error) => {
  //     console.error(" Deno.serve Error:", error);
  //     return new Response("Internal Server Error", { status: 500 });
  //   },
  // });
  Deno.serve({
    port: port,
    onListen: ({ hostname, port }) => {
      console.log(
        `Server is listening on http://${hostname}:${port}`,
      );
    },
    onError: (error) => {
      console.error("Deno.serve Error:", error);
      return new Response("Internal Server Error", { status: 500 });
    },
  }, app.fetch);
}

// --- Example Usage ---
createServer({
  getLoadContext: (c) => {
    // Example: Provide database connection, user session, etc.
    // Access Hono context `c` here (e.g., c.env, c.req)
    return {
      // lang: "en-US", // Example language
      // t: "en", // Example translation
      // isProductionDeployment: false, // Example flag
      // env: c.env, // Pass Deno.env if needed
      // clientEnv: c.env, // Example client environment
      // Example data
      db: "mock_db_connection",
      honoContext: c, // Pass Hono context if needed by loaders
      // Add other custom context properties here
      nrs_test: "nrs_test_value_from_context",
    } satisfies AppLoadContext; // Use satisfies for type checking
  },
  configure: (app) => {
    // Optional: Add more custom Hono middleware
    app.use(async (c, next) => {
      console.log(`-> Custom middleware processing: ${c.req.url}`);
      await next();
      c.header("X-Custom-Header", "Set by configure hook");
      console.log(`<- Custom middleware processed: ${c.req.status}`);
    });
  },
}).catch((err) => {
  console.error("❌ Failed to create server:", err);
  Deno.exit(1);
});
