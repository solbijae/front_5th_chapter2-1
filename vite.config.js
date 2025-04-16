import { defineConfig } from 'vitest/config';
// import { resolve } from 'path';
// import { fileURLToPath } from 'url';
// import { URL } from 'url';
import react from '@vitejs/plugin-react';

// const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.js',
  },
  // resolve: {
  //   alias: {
  //     '@': resolve(__dirname, './src'),
  //   },
  // },
});
