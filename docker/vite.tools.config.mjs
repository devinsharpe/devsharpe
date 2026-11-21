// Builds the scripts the production container runs into self-contained files
// in .output/tools, with their dependencies bundled in, so the image needs no
// node_modules: the migrations and bucket setup that run before the server
// starts (see docker/start.mjs), and the seed, run by hand (`npm run seed` in
// the container). `npm run build` runs this after the app build (which clears
// .output first).
import { cpSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

// The seed reads its Markdown from ./content next to itself, so the built
// seed gets a copy next to it.
const SEED_CONTENT = "src/server/database/seed/content";

/** Copies the seed's content into the output folder after each build. */
function copySeedContent() {
  let root = "";
  let out_dir = "";
  return {
    name: "copy-seed-content",
    configResolved(config) {
      root = config.root;
      out_dir = path.resolve(config.root, config.build.outDir);
    },
    writeBundle() {
      cpSync(path.join(root, SEED_CONTENT), path.join(out_dir, "content"), {
        recursive: true,
      });
    },
  };
}

export default defineConfig({
  publicDir: false,
  logLevel: "warn",
  // The seed imports through the `~/` alias.
  resolve: { tsconfigPaths: true },
  ssr: { noExternal: true },
  plugins: [copySeedContent()],
  build: {
    ssr: true,
    outDir: ".output/tools",
    emptyOutDir: true,
    target: "node22",
    minify: false,
    rolldownOptions: {
      input: {
        migrate: "src/server/database/migrate.server.ts",
        "setup-bucket": "docker/setup-bucket.mjs",
        seed: "src/server/database/seed/index.server.ts",
      },
      // pg's optional native bindings; only loaded if asked for.
      external: ["pg-native"],
      output: {
        format: "esm",
        entryFileNames: "[name].mjs",
        // Code the scripts share. .mjs, since there's no package.json here to
        // say .js files are ES modules.
        chunkFileNames: "chunks/[name]-[hash].mjs",
      },
    },
  },
});
