import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/components/ui/*.tsx', 'src/lib/utils.ts'],
    outDir: 'dist',
    format: ['cjs', 'esm'],
    // Disable code splitting; the CJS build emits an ESM passthrough index
    // (bare `export *`) when entries re-export other entries, which breaks
    // Node's CommonJS resolution.
    splitting: false,
    external: [
      'react',
      'react-dom',
      'radix-ui',
      'cmdk',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'embla-carousel-react',
    ],
    dts: true,
    sourcemap: true,
  },
]);
