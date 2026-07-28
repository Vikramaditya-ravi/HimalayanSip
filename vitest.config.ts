import { defineConfig } from 'vitest/config';

export default defineConfig({
  // The .jsx sources have no `import React`, relying on the automatic JSX
  // runtime that the Vite build applies. Vitest defaults to classic for .jsx.
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'lib/**/*.test.ts'],
  },
});
