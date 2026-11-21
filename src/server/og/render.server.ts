// Server-only: draws share cards and icons. satori lays out an element tree
// (JSX, with a subset of CSS) and turns it into SVG, text included as paths;
// resvg turns the SVG into a PNG. Both are WebAssembly, so the build is the
// same on every platform. The production image has no node_modules, so
// resvg's .wasm and the font are built into the server bundle (`?base64`, see
// vite.config.ts).
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import resvg_wasm from "@resvg/resvg-wasm/index_bg.wasm?base64";
import type { ReactNode } from "react";
import satori from "satori";
import nudica from "../../../public/fonts/nudica-regular-webfont.ttf?base64";

/** The bytes of a `?base64` import. */
function fromBase64(base64: string) {
  return Buffer.from(base64, "base64");
}

// The site's own font (see styles/nudica.css). It's the only one: text in
// a script it doesn't cover won't show.
const FONTS = [
  {
    name: "Nudica",
    data: fromBase64(nudica),
    weight: 400 as const,
    style: "normal" as const,
  },
];

let resvg_ready: Promise<void> | null = null;

/** Loads resvg's WebAssembly, once (it can only be initialized once). */
function initResvg() {
  resvg_ready ??= initWasm(fromBase64(resvg_wasm)).catch((error) => {
    resvg_ready = null;
    throw error;
  });
  return resvg_ready;
}

/** `element` as SVG, `width` by `height` pixels. */
export function renderSvg(element: ReactNode, width: number, height: number) {
  return satori(element, { width, height, fonts: FONTS });
}

/** `element` as a PNG, `width` by `height` pixels. */
export async function renderPng(
  element: ReactNode,
  width: number,
  height: number,
) {
  const [svg] = await Promise.all([
    renderSvg(element, width, height),
    initResvg(),
  ]);
  // The SVG's text is already paths, so resvg needs no fonts of its own.
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  });
  const image = resvg.render();
  try {
    return image.asPng();
  } finally {
    // WebAssembly memory isn't garbage-collected.
    image.free();
    resvg.free();
  }
}
