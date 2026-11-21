/** A file's bytes, base64-encoded at build time (see vite.config.ts). */
declare module "*?base64" {
  const base64: string;
  export default base64;
}
