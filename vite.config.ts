import { readFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';

const BASE64_SUFFIX = '?base64'
const BASE64_PREFIX = '\0base64:'

/**
 * `import data from "./file?base64"`: the file's bytes as a base64 string,
 * read at build time. For binary files server code needs at runtime (the
 * share cards' WebAssembly and font), since the production image has no
 * node_modules. Vite's own `?inline` doesn't reach .wasm files in the server
 * build.
 */
function base64Import(): Plugin {
  return {
    name: 'base64-import',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (!source.endsWith(BASE64_SUFFIX)) return null
      const file = source.slice(0, -BASE64_SUFFIX.length)
      const resolved = await this.resolve(file, importer, { skipSelf: true })
      if (!resolved) throw new Error(`Can't find ${file} (from ${importer})`)
      // Ends in the suffix, so plugins that handle .wasm files skip it.
      return BASE64_PREFIX + resolved.id + BASE64_SUFFIX
    },
    load(id) {
      if (!id.startsWith(BASE64_PREFIX)) return null
      const file = id.slice(BASE64_PREFIX.length, -BASE64_SUFFIX.length)
      this.addWatchFile(file)
      const base64 = readFileSync(file).toString('base64')
      return `export default ${JSON.stringify(base64)};`
    },
  }
}

// Node server build: `vite build` emits .output/server/index.mjs (run with `npm start`).
export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  plugins: [
    base64Import(),
    tanstackStart(), // must precede the React plugin
    nitro({ preset: 'node-server' }),
    tailwindcss(),
    viteReact(),
  ],
})
