import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';

type BundleTarget = {
  entry: string;
  name: string;
  fileName: string;
  emptyOutDir: boolean;
};

const BUNDLE_TARGETS: Record<string, BundleTarget> = {
  summary: {
    entry: './src/article-summary-entry.ts',
    name: 'ArticleSummary',
    fileName: 'ArticleSummary.js',
    emptyOutDir: true,
  },
  rag: {
    entry: './src/rag-assistant-entry.ts',
    name: 'RagAssistant',
    fileName: 'RagAssistant.js',
    emptyOutDir: false,
  },
};

function copyToStatic(file: string): Plugin {
  return {
    name: 'copy-to-static',
    closeBundle() {
      const distDir = join(process.cwd(), 'dist');
      const staticDir = fileURLToPath(new URL('../src/main/resources/static', import.meta.url));

      // 确保 static 目录存在
      if (!existsSync(staticDir)) {
        mkdirSync(staticDir, { recursive: true });
      }

      const src = join(distDir, file);
      const dest = join(staticDir, file);
      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to ${staticDir}`);
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const target = BUNDLE_TARGETS[mode] || BUNDLE_TARGETS.summary;

  return {
    build: {
      emptyOutDir: target.emptyOutDir,
      lib: {
        entry: target.entry,
        name: target.name,
        fileName: (format) => {
          if (format === 'umd') {
            return target.fileName;
          }
          return target.fileName.replace(/\.js$/, '.es.js');
        },
        formats: ['umd'],
      },
    },
    plugins: [
      copyToStatic(target.fileName),
    ],
    server: {
      port: 3001,
    },
  };
});
