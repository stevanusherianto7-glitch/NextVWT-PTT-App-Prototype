declare module 'rollup-plugin-javascript-obfuscator' {
  import { Plugin } from 'vite';
  const JavaScriptObfuscator: (options?: Record<string, unknown>) => Plugin;
  export default JavaScriptObfuscator;
}
