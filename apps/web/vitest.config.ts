import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@/lib': resolve(__dirname, './src/lib'),
      '@/app': resolve(__dirname, './app'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'app/**/*.test.ts'],
  },
});
