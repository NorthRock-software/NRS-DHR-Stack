<div align="center">
  <a href="https://northrock.software/">
    <img src="https://github.com/NorthRock-software/DHR-Stack/blob/main/docs/images/main.png" width="400" height="auto" alt="DHR" />
  </a>
</div>

# Welcome to the DHR-Stack !

A modern template for building full-stack React applications using Deno, Hono and React Router.

## Quick Start

#### Install Deno >2.3.1 [more options](https://docs.deno.com/runtime/getting_started/installation/):

Linux:

```bash
curl -fsSL https://deno.land/install.sh | sh
```

Windows:

```bash
scoop install deno
# or
winget install DenoLand.Deno
```

macOS:

```bash
brew install deno
```

#### Install dependencies

```bash
deno install --allow-scripts
```

### Development

Start the development server:

```bash
deno task dev
```

Your application will be available at `http://localhost:3000`.

## Building for Production

Create a production build:

```bash
deno task compile:linux
```

---

## Inspirations
- [react-router-hono-server](https://github.com/rphlmr/react-router-hono-server)
- [hono-react-router-adapter](https://github.com/yusukebe/hono-react-router-adapter)
- [@hono/vite-dev-server](https://github.com/honojs/vite-plugins/tree/main/packages/dev-server)
- [react-router-deno-template](https://github.com/redabacha/react-router-deno-template/tree/main)

@react‑router/fs‑routes	MIT
hono	MIT
isbot	Unlicense
react	MIT
react‑dom	MIT
react‑router	MIT
@deno/vite‑plugin	MIT
@hono/node‑server	MIT
@hono/node‑ws	MIT
@react‑router/dev	MIT
@react‑router/node	MIT
@tailwindcss/vite	MIT
@types/node	MIT
@types/react	MIT
@types/react‑dom	MIT
react‑router‑devtools	MIT
tailwindcss	MIT

Built with ❤️ by NorthRock software.
