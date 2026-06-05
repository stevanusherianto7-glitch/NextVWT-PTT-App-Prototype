import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


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
      sourcemap: true,
      // Optimize bundle size for production
      rollupOptions: {
        output: {
          manualChunks: {
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
    ],

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
