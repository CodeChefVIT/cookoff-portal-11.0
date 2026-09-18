import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Vitest doesn't load `.env.local`, so `src/env.ts`'s `z.url()` check on
    // NEXT_PUBLIC_API_URL failed at import and took down every test file that
    // reaches `@/api` — 15 of 42, including the whole submission surface. CI
    // set this per-job, so `pnpm test` was green there and broken locally.
    env: { SKIP_ENV_VALIDATION: 'true' },
  },
});
