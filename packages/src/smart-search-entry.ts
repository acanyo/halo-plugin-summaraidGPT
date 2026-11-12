import { fetchSearchConfig } from './smart-search/api';
import { bridgeSearchWidget } from './smart-search/bridge';
import type { SearchOptions } from './smart-search/types';

let ready: Promise<void> | undefined;

async function initialize() {
  const config = await fetchSearchConfig();
  if (config.enable) bridgeSearchWidget(config);
}

/** Optional theme helper. Always opens the official Halo modal. */
export async function open(options: SearchOptions = {}) {
  await boot();
  if (!customElements.get('search-modal')) {
    console.warn('[智阅搜索] 请先启用 Halo 官方搜索组件');
    return;
  }
  let modal = document.querySelector<HTMLElement & { options?: SearchOptions; open?: boolean }>('search-modal');
  if (!modal) { modal = document.createElement('search-modal'); document.body.append(modal); }
  modal.options = options;
  modal.open = true;
}

function boot() {
  return ready ??= initialize().catch(error => { console.warn('[智阅搜索] 初始化失败', error); });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void boot(), { once: true });
else void boot();
