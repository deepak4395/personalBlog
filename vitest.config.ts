import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types.ts',
      ],
    },
    setupFiles: ['./test-setup.ts'],
  },
  resolve: {
    alias: {
      '@personalBlog/core': resolve(__dirname, './packages/core/src'),
      '@personalBlog/agent-bhagavad-gita': resolve(__dirname, './packages/agent-bhagavad-gita/src'),
    },
  },
});
