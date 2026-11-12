import { SmartSearchExtension, type NativeSearchForm } from './widget';
import type { SmartSearchConfig } from './types';

/** Add a small extension to existing forms, without replacing their markup or open accessor. */
export function bridgeSearchWidget(config: SmartSearchConfig, root: Document = document): () => void {
  const modals = new Map<HTMLElement, MutationObserver>();
  const layers = new Set<HTMLStyleElement>();
  const extensions = new Set<SmartSearchExtension>();
  let stopped = false;

  const enhance = async (form: NativeSearchForm, modal: HTMLElement) => {
    await form.updateComplete;
    if (stopped || !form.isConnected || !form.shadowRoot || form.shadowRoot.querySelector('summaraid-search-extension')) return;
    const header = form.shadowRoot.querySelector('form')?.parentElement;
    if (!header) return; // Unknown component version: leave the official search untouched.
    if (!modal.shadowRoot?.querySelector('style[data-summaraid-search-layer]')) {
      // Keep the native dialog above this plugin's floating assistant (z-index: 99999).
      const layer = document.createElement('style');
      layer.dataset.summaraidSearchLayer = '';
      layer.textContent = ':host { position:relative; z-index:100000; }';
      modal.shadowRoot?.append(layer);
      layers.add(layer);
    }
    const extension = document.createElement('summaraid-search-extension') as SmartSearchExtension;
    extension.config = config;
    header.after(extension);
    extension.attach(form);
    extensions.add(extension);
  };
  const scan = () => {
    for (const [modal, observer] of modals) {
      if (!modal.isConnected) { observer.disconnect(); modals.delete(modal); }
    }
    for (const extension of extensions) if (!extension.isConnected) extensions.delete(extension);
    root.querySelectorAll<HTMLElement>('search-modal').forEach(modal => {
      if (!modal.shadowRoot) return;
      const scanForms = () => {
        for (const extension of extensions) if (!extension.isConnected) extensions.delete(extension);
        modal.shadowRoot!.querySelectorAll<NativeSearchForm>('search-form').forEach(form => void enhance(form, modal));
      };
      if (!modals.has(modal)) {
        const observer = new MutationObserver(scanForms);
        observer.observe(modal.shadowRoot, { childList: true, subtree: true });
        modals.set(modal, observer);
      }
      scanForms();
    });
  };
  const observer = new MutationObserver(scan);
  void customElements.whenDefined('search-modal').then(() => {
    if (stopped) return;
    scan();
    observer.observe(root.documentElement, { childList: true, subtree: true });
  });
  return () => {
    stopped = true;
    observer.disconnect();
    modals.forEach(observer => observer.disconnect());
    layers.forEach(layer => layer.remove());
    extensions.forEach(extension => extension.remove());
    modals.clear(); layers.clear(); extensions.clear();
  };
}
