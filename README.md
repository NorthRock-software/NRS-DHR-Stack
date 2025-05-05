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

Built with ❤️ by NorthRock software.
