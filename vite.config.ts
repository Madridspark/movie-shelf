import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const resolveSrc = (dir: string) => path.resolve(rootDir, 'src', dir);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@app': resolveSrc('app'),
      '@pages': resolveSrc('pages'),
      '@features': resolveSrc('features'),
      '@entities': resolveSrc('entities'),
      '@shared': resolveSrc('shared'),
      '@store': resolveSrc('store'),
      '@styles': resolveSrc('styles')
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist-vite'
  }
});
