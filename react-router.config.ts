import type { Config } from "@react-router/dev/config";

// declare module "react-router" {
//   interface Future {
//     unstable_middleware: true; // Enable middleware types
//   }
// }

export default {
  // to enable SPA mode set this to `false`
  ssr: true,
  future: {
    unstable_optimizeDeps: true,
    unstable_splitRouteModules: true,
    // unstable_middleware: true,
    // unstable_subResourceIntegrity: true,
    // unstable_viteEnvironmentApi: true,
  },
} satisfies Config;
