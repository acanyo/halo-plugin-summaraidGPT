const READER = '/plugins/plugin-lingui/assets/reader/lingui-reader.js';
const STYLES = '/plugins/plugin-lingui/assets/reader/lingui-reader.css';
const TAG = 'lingui-component';
export const SUMMARY_CALLBACK = 'zhiyue.summary';

export interface LinguiSummaryData {
  title: string;
  gptName: string;
  content: string;
  postId: string;
  loading: boolean;
  error: string;
}

interface EventReport {
  runId?: string;
  phase: string;
  scope?: string;
}

interface LinguiElement extends HTMLElement {
  interactions: {
    inheritRegistered: boolean;
    requests: { allow: () => boolean };
    callbacks: Record<string, (args: unknown, context: { runId?: string }) => LinguiSummaryData>;
    onEvent: (report: EventReport) => void;
  };
}

let readerReady: Promise<void> | undefined;

export function ensureLinguiReader(): Promise<void> {
  if (customElements.get(TAG)) return Promise.resolve();
  if (readerReady) return readerReady;

  readerReady = new Promise<void>((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) =>
      new URL(script.src || document.baseURI, document.baseURI).pathname === READER,
    );
    const script = existing || document.createElement('script');
    const timeout = window.setTimeout(() => fail(), 10000);
    function cleanup() {
      window.clearTimeout(timeout);
      script.removeEventListener('error', fail);
    }
    function fail() {
      cleanup();
      if (!existing) script.remove();
      reject(new Error('灵构 UI 渲染资源不可用'));
    }
    script.addEventListener('error', fail, { once: true });
    void customElements.whenDefined(TAG).then(() => { cleanup(); resolve(); });
    if (!existing) {
      script.src = READER;
      script.defer = true;
      document.head.append(script);
    }
    if (!document.querySelector(`link[href="${STYLES}"]`)) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = STYLES;
      document.head.append(style);
    }
  }).catch((error: unknown) => {
    readerReady = undefined;
    throw error;
  });
  return readerReady;
}

/** The callback handshake keeps static or unavailable works from replacing the real summary. */
export function mountLinguiSummary(
  host: HTMLElement,
  projectId: string,
  data: LinguiSummaryData,
  onReady: () => void,
  onFailure: () => void,
): () => void {
  let stopped = false;
  let element: LinguiElement | undefined;
  let timeout: number | undefined;
  const runs = new Set<string>();
  function dispose() {
    stopped = true;
    window.clearTimeout(timeout);
    element?.remove();
  }
  function fail() {
    if (stopped) return;
    dispose();
    onFailure();
  }

  void ensureLinguiReader().then(() => {
    if (stopped || !host.isConnected) return;
    // Create after registration: setting properties on an unupgraded element shadows its setters.
    element = document.createElement(TAG) as LinguiElement;
    element.slot = 'lingui-summary';
    element.setAttribute('data-lingui', projectId);
    element.interactions = {
      inheritRegistered: false,
      requests: { allow: () => false },
      callbacks: {
        [SUMMARY_CALLBACK]: (_args, context) => {
          if (context.runId) runs.add(context.runId);
          return { ...data };
        },
      },
      onEvent: (report) => {
        if (stopped || report.scope || !report.runId || !runs.has(report.runId)) return;
        if (report.phase === 'success') {
          window.clearTimeout(timeout);
          onReady();
        } else if (report.phase === 'error') {
          fail();
        }
      },
    };
    timeout = window.setTimeout(fail, 18000);
    host.append(element);
  }).catch(fail);

  return dispose;
}
