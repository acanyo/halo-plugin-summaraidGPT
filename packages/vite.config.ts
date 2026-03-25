import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';


function copyToStatic(): Plugin {
  return {
    name: 'copy-to-static',
    closeBundle() {
      const distDir = join(process.cwd(), 'dist');
      const staticDir = fileURLToPath(new URL('../src/main/resources/static', import.meta.url));

      // 确保 static 目录存在
      if (!existsSync(staticDir)) {
        mkdirSync(staticDir, { recursive: true });
      }

      const file = 'ArticleSummary.js';
      const src = join(distDir, file);
      const dest = join(staticDir, file);
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to ${staticDir}`);
      }
    },
  };
}

export default defineConfig({
  build: {
    lib: {
      entry: './src/article-summary-entry.ts',
      name: 'ArticleSummary',
      fileName: (format) => {
        if (format === 'umd') {
          return 'ArticleSummary.js';
        }
        return 'ArticleSummary.es.js';
      },
      formats: ['umd']
    }
  },
  plugins: [
    copyToStatic(),
  ],
  // 开发服务器配置
  server: {
    port: 3001
  }
});
