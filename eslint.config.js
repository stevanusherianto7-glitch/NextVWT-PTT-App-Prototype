// eslint.config.js – ESLint v9/v10 Flat Config for NextVWT
// Stack: React 18 + TypeScript + Vite
// Note: eslint-plugin-react@7.x belum fully support ESLint v10 context API
//       → gunakan TypeScript-ESLint + react-hooks saja, skip legacy react rules

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ─── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'tmp/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'eslint.config.js',
      'playwright.config.ts',
      'postcss.config.mjs',
      'vite.config.ts',
    ],
  },

  // ─── Base JS recommended ────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript strict recommended ─────────────────────────────────────────
  ...tseslint.configs.recommended,

  // ─── React Hooks (ESLint v10 safe) ─────────────────────────────────────────
  {
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // Hooks – critical rules
      'react-hooks/rules-of-hooks': 'error',   // Enforce hook call order
      'react-hooks/exhaustive-deps': 'warn',   // Warn on missing deps

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      // Allow @ts-expect-error (used intentionally in store for dynamic keys)
      '@typescript-eslint/ban-ts-comment': ['warn', {
        'ts-expect-error': 'allow-with-description',
      }],

      // General quality
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // ─── Prettier disables formatting rules (must be last) ─────────────────────
  prettierConfig,
);
