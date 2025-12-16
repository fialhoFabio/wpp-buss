import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'waku/config';
import path from 'node:path';

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        components: path.resolve(process.cwd(), 'src/components'),
        lib: path.resolve(process.cwd(), 'src/lib'),
        pages: path.resolve(process.cwd(), 'src/pages'),
        types: path.resolve(process.cwd(), 'src/types'),
      },
    },
    plugins: [
      tailwindcss(),
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
  },
});
