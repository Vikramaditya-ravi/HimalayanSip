import { defineConfig } from 'vitest/config';

export default defineConfig({
  // App.jsx has no `import React`, relying on the automatic JSX runtime that
  // the Vite build applies. Vitest defaults to the classic runtime for .jsx.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'lib/**/*.test.ts'],
  },
});
