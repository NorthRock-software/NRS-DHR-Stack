import * as path from "jsr:@std/path";
import type { AppLoadContext, ServerBuild } from "react-router";
import type { Context } from "hono";
import type { ViteDevServer } from "vite";

export type GetLoadContextFunction = (
  c: Context,
) => Promise<AppLoadContext> | AppLoadContext;

// Determines the application build mode.
export function getBuildMode(): "development" | "production" {
  return Deno.env.get("NODE_ENV") === "development"
    ? "development"
    : "production";
}

export const CWD = Deno.env.get("REACT_ROUTER_ROOT") ?? Deno.cwd();
const SERVER_BUILD_DIR = path.resolve(CWD, "build", "server");
// Assuming your server entry point after build is 'index.js'
const SERVER_BUILD_PATH = path.join(SERVER_BUILD_DIR, "index.js");

/**
 * Imports the server build based on the mode.
 * Handles dynamic import for production and Vite SSR load for development.
 */
export async function importBuild(vite?: ViteDevServer): Promise<ServerBuild> {
  const mode = getBuildMode();

  if (mode === "production") {
    // Use file URL for dynamic import in Deno, especially cross-platform
    const fileUrl = path.toFileUrl(SERVER_BUILD_PATH);
    console.log(`🚀 Loading production build from: ${fileUrl}`);
    try {
      // Deno requires specifying the file extension for dynamic imports
      const buildModule = await import(fileUrl.href + "?ts=" + Date.now()); // Cache bust
      return buildModule as ServerBuild;
    } catch (error) {
      console.error(
        `❌ Failed to load production build from ${fileUrl.href}`,
        error,
      );
      throw new Error("Failed to load production server build.");
    }
  } else {
    if (!vite) {
      throw new Error("Vite Dev Server is required in development mode.");
    }
    console.log("🚀 Loading development build via Vite...");
    try {
      // Vite handles HMR and provides the latest build
      const buildModule = await vite.ssrLoadModule(
        "virtual:react-router/server-build", // Or 'virtual:remix/server-build' if using Remix adapter
      );
      return buildModule as ServerBuild;
    } catch (error) {
      console.error("❌ Failed to load development build via Vite.", error);
      throw new Error("Failed to load development server build.");
    }
  }
}

/**
 * Creates the getLoadContext function for the request handler.
 * Uses the provided function or a default.
 */
export function createGetLoadContext(
  userGetLoadContext?: GetLoadContextFunction,
): GetLoadContextFunction {
  return userGetLoadContext ?? ((c: Context) => c.env as AppLoadContext); // Default uses Hono context env
}

// Define AppLoadContext extensions if needed (as commented out in original)
// declare module '@remix-run/node' { // Or appropriate react-router type path
// 	interface AppLoadContext {
// 		// Add your custom context here
// 		db: any;
//     honocontext: Context;
// 	}
// }
