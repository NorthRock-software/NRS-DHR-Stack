// import * as path from "jsr:@std/path";
// import * as colors from "jsr:@std/fmt/colors";
// import type { AppLoadContext, ServerBuild } from "react-router";
// import type { Context } from "hono";
// import type { ViteDevServer } from "vite";
// import type { Hono, HonoServerOptionsBase } from "hono";

// // export type GetLoadContextFunction = (
// //   c: Context,
// // ) => Promise<AppLoadContext> | AppLoadContext;

// export function getBuildMode(): "development" | "staging" | "production" {
//   const mode = Deno.env.get("MODE");
//   switch (mode) {
//     case "development":
//       return "development";
//     case "staging":
//       return "staging";
//     case "production":
//       return "production";
//     default:
//       return "development"; // Default to development if not specified
//   }
// }

// export const CWD = Deno.env.get("REACT_ROUTER_ROOT") ?? Deno.cwd();
// const SERVER_BUILD_DIR = path.resolve(CWD, "build", "server");
// const SERVER_BUILD_PATH = path.join(SERVER_BUILD_DIR, "index.js");

// // export async function importBuild(vite?: ViteDevServer): Promise<ServerBuild> {
// //   const mode = getBuildMode();
// //   if (mode === "production") {
// //     // const buildPath = import.meta.resolve(SERVER_BUILD_PATH);
// //     const fileUrl = path.toFileUrl(SERVER_BUILD_PATH);
// //     console.log(colors.green(`🚀 Loading production build from: ${fileUrl}`));
// //     try {
// //       // const prodBuild = await import(fileUrl.href + "?ts=" + Date.now()); // Cache bust
// //       const prodBuild = await import(fileUrl.href);
// //       return (prodBuild.default || prodBuild) as ServerBuild;
// //     } catch (error) {
// //       console.error(
// //         `❌ Failed to load production build from ${fileUrl.href}`,
// //         error,
// //       );
// //       throw new Error("Failed to load production server build.");
// //     }
// //   } else {
// //     if (!vite) {
// //       throw new Error("Vite Dev Server is required in development mode.");
// //     }
// //     console.log(colors.green("🚀 Loading development build via Vite..."));
// //     try {
// //       const devBuild = await vite.ssrLoadModule(
// //         "virtual:react-router/server-build", // Or 'virtual:remix/server-build' if using Remix adapter
// //       );
// //       return devBuild as ServerBuild;
// //     } catch (error) {
// //       console.error(
// //         colors.red("❌ Failed to load development build via Vite." + error),
// //       );
// //       throw new Error("Failed to load development server build.");
// //     }
// //   }
// // }
// export async function importBuild(vite?: ViteDevServer): Promise<ServerBuild> {
//   const mode = getBuildMode();
//   if (mode === "production") {
//     const fileUrl = path.toFileUrl(SERVER_BUILD_PATH);
//     console.log(
//       colors.green(
//         `RRM Helper: Loading production build from: ${fileUrl.pathname}`,
//       ),
//     );
//     try {
//       // Add cache busting if needed: ?v=${Date.now()}
//       const prodBuild = await import(`${fileUrl.href}?v=${Date.now()}`);
//       return (prodBuild.default || prodBuild) as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(
//           `RRM Helper: ❌ Failed to load production build from ${fileUrl.href}`,
//         ),
//         error,
//       );
//       throw new Error("Failed to load production server build.");
//     }
//   } else {
//     // Development mode
//     if (!vite) {
//       // This might happen on the very first request before vite is fully ready?
//       // Or if the vite instance isn't passed correctly.
//       console.error(
//         colors.red(
//           "RRM Helper: ❌ Vite Dev Server instance is missing in development mode.",
//         ),
//       );
//       throw new Error(
//         "Vite Dev Server is required in development mode for importBuild.",
//       );
//     }
//     console.log(
//       colors.green("RRM Helper: Loading development build via Vite..."),
//     );
//     try {
//       const devBuild = await vite.ssrLoadModule(
//         "virtual:react-router/server-build", // or 'virtual:remix/server-build' if using Remix adapter
//       );
//       return devBuild as ServerBuild;
//     } catch (error) {
//       console.error(
//         colors.red(
//           "RRM Helper: ❌ Failed to load development build via Vite.",
//         ),
//         error,
//       );
//       throw new Error("Failed to load development server build.");
//     }
//   }
// }
// /**
//  * Creates the getLoadContext function for the request handler.
//  * Uses the provided function or a default.
//  */
// // export function createGetLoadContext(
// //   userGetLoadContext?: GetLoadContextFunction,
// // ): GetLoadContextFunction {
// //   return userGetLoadContext ?? ((c: Context) => c.env as AppLoadContext); // Default uses Hono context env
// // }
// export function createGetLoadContext(
//   getLoadContext: HonoServerOptionsBase<Env>["getLoadContext"],
// ) {
//   return getLoadContext;
// }
// // Define AppLoadContext extensions if needed (as commented out in original)
// // declare module '@remix-run/node' { // Or appropriate react-router type path
// // 	interface AppLoadContext {
// // 		// Add your custom context here
// // 		db: any;
// //     honocontext: Context;
// // 	}
// // }

// export interface ServerOptions {
//   port?: number;
//   configure?: (app: Hono<any, any, any>) => void | Promise<void>;
//   getLoadContext?: GetLoadContextFunction;
// }

// server/helpers.ts
import * as path from "jsr:@std/path";
import * as colors from "jsr:@std/fmt/colors";
import type { AppLoadContext, ServerBuild } from "react-router";
import type { Context } from "hono";
import type { ViteDevServer } from "vite";

// Define GetLoadContextFunction type for clarity in ServerOptions
export type GetLoadContextFunction = (
  c: Context,
) => AppLoadContext | Promise<AppLoadContext>;

export function getBuildMode(): "development" | "production" {
  // Prefer NODE_ENV for consistency with Vite/Node ecosystem
  const mode = Deno.env.get("NODE_ENV") || Deno.env.get("MODE");
  switch (mode) {
    case "production":
      return "production";
    default:
      // Treat anything else (undefined, 'development', etc.) as development
      return "development";
  }
}

export const CWD = Deno.env.get("REACT_ROUTER_ROOT") ?? Deno.cwd();
const SERVER_BUILD_DIR = path.resolve(CWD, "build", "server");
// Ensure this matches the output file in your vite.config.ts ssr build
const SERVER_BUILD_PATH = path.join(SERVER_BUILD_DIR, "index.js");
// This virtual module ID must match the one provided by your Vite setup
// (often via @vitejs/plugin-react or a specific React Router adapter)
const VIRTUAL_BUILD_ID = "virtual:react-router/server-build";

// Basic validation for the imported build module
function isValidServerBuild(build: any): build is ServerBuild {
  return build && typeof build === "object" &&
    typeof build.assets !== "undefined" && typeof build.routes !== "undefined";
}

export async function importBuild(vite?: ViteDevServer): Promise<ServerBuild> {
  const mode = getBuildMode();

  if (mode === "production") {
    const fileUrl = path.toFileUrl(SERVER_BUILD_PATH);
    console.log(
      colors.cyan(
        `[ImportBuild] Loading production build: ${fileUrl.pathname}`,
      ),
    );
    try {
      // Cache bust import for production updates without server restart
      // const prodBuildModule = await import(`${fileUrl.href}?v=${Date.now()}`);
      const prodBuildModule = await import(`${fileUrl.href}`);
      const build = prodBuildModule.default || prodBuildModule;

      if (!isValidServerBuild(build)) {
        throw new Error(
          "Imported module does not look like a valid React Router ServerBuild.",
        );
      }
      console.log(
        colors.green(`[ImportBuild] Production build loaded successfully.`),
      );
      return build;
    } catch (error) {
      console.error(
        colors.red(
          `[ImportBuild] ❌ Failed to load production build from ${fileUrl.href}`,
        ),
        error,
      );
      throw new Error(
        `Failed to load production server build: ${error.message}`,
      );
    }
  } else {
    // Development mode
    if (!vite) {
      console.error(
        colors.red(
          "[ImportBuild] ❌ Vite Dev Server instance is missing in development mode.",
        ),
      );
      throw new Error(
        "Vite Dev Server is required in development mode for importBuild.",
      );
    }
    console.log(
      colors.cyan(
        `[ImportBuild] Loading development build via Vite (${VIRTUAL_BUILD_ID})...`,
      ),
    );
    try {
      const devBuildModule = await vite.ssrLoadModule(VIRTUAL_BUILD_ID);
      const build = devBuildModule.default || devBuildModule;

      if (!isValidServerBuild(build)) {
        throw new Error(
          `Loaded module from ${VIRTUAL_BUILD_ID} does not look like a valid React Router ServerBuild.`,
        );
      }
      console.log(
        colors.green(
          `[ImportBuild] Development build loaded successfully via ${VIRTUAL_BUILD_ID}.`,
        ),
      );
      return build;
    } catch (error) {
      vite.ssrFixStacktrace(error as Error); // Enhance stack trace
      console.error(
        colors.red(
          `[ImportBuild] ❌ Failed to load development build via Vite (${VIRTUAL_BUILD_ID}).`,
        ),
        error,
      );
      throw new Error(
        `Failed to load development server build: ${error.message}`,
      );
    }
  }
}
