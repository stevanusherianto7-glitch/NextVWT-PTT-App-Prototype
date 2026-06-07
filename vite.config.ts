import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'rollup-plugin-javascript-obfuscator'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ command: _command, mode }) => {
  // Load env file based on `mode` in the working directory.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: './',
    // Development server configuration
    server: {
      port: 5173,
      host: 'localhost',
      // For mobile testing via local network
      strictPort: true,
    },

    // Build configuration for production
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          passes: 3,
        },
        mangle: {
          toplevel: true,
        },
        format: {
          comments: false,
        },
      },
      // Optimize bundle size for production
      rollupOptions: {
        output: {
          manualChunks: mode === 'production' ? undefined : {
            // Split vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            // Split UI library chunks
            ui: ['@radix-ui/react-slot', '@radix-ui/react-dialog'],
          },
        },
      },
    },

    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      // Advanced JS Obfuscation for Production builds (SEC-01)
      mode === 'production' &&
        (JavaScriptObfuscator as unknown as (options: Record<string, unknown>) => unknown)({
          include: ['src/**/*.ts', 'src/**/*.tsx'],
          exclude: ['node_modules/**'],
          options: {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: true,
            debugProtectionInterval: 4000,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            identifiersPrefix: 'nvt_',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            rotateStringArray: true,
            selfDefending: true,
            shuffleStringArray: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ['rc4'],
            stringArrayIndexShift: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: 0.75,
            transformObjectKeys: true,
            unicodeEscapeSequence: true,
          },
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],

    // Vitest configuration – exclude Playwright e2e spec files from unit test discovery
    test: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts'],
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
      environment: 'node',
    },

    // Define global constants for use in the app
    define: {
      // Pass environment variables to the client
      'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(env.VITE_VERCEL_ENV),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    },
  }
})
