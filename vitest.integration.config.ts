import { defineConfig } from 'vitest/config';

/**
 * Integration tests against a real PostgreSQL instance.
 *
 * Separate from the default config so `npm test` stays fast and needs no
 * database, while `npm run test:db` verifies the SQL for real.
 */
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  test: {
    globals: true,
    environment: 'node',
    include: ['lib/**/*.itest.ts'],
    // Seeding plus every aggregate query; the whole file shares one database,
    // so it must not run in parallel with itself.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 60_000,
    hookTimeout: 120_000,
  },
});
