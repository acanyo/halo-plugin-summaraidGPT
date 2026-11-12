/** Keep the overlay inside the visible screen, including the mobile keyboard and zoom. */
export function observeAssistantViewport(host: HTMLElement): () => void {
  const viewport = window.visualViewport;
  const sync = () => {
    host.style.setProperty('--rag-viewport-width', `${viewport?.width || window.innerWidth}px`);
    host.style.setProperty('--rag-viewport-height', `${viewport?.height || window.innerHeight}px`);
    host.style.setProperty('--rag-viewport-left', `${viewport?.offsetLeft || 0}px`);
    host.style.setProperty('--rag-viewport-top', `${viewport?.offsetTop || 0}px`);
  };
  sync();
  window.addEventListener('resize', sync, { passive: true });
  viewport?.addEventListener('resize', sync, { passive: true });
  viewport?.addEventListener('scroll', sync, { passive: true });
  return () => {
    window.removeEventListener('resize', sync);
    viewport?.removeEventListener('resize', sync);
    viewport?.removeEventListener('scroll', sync);
  };
}
