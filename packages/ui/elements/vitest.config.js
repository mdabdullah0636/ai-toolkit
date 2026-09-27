import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ai-toolkit/shadcn-ui': path.resolve(__dirname, '../shadcn-ui/src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.ui.test.ts', 'src/**/*.ui.test.tsx'],
    setupFiles: ['./src/vitest-setup.ts'],
  },
});
