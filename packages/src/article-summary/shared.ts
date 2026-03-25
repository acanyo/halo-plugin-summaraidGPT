export interface SummaryTheme {
  bg?: string;
  main?: string;
  contentFontSize?: string;
  title?: string;
  content?: string;
  gptName?: string;
  contentBg?: string;
  border?: string;
  shadow?: string;
  tagBg?: string;
  tagColor?: string;
  cursor?: string;
}

export interface SummaryWidgetConfig {
  logo: string;
  summaryTitle: string;
  gptName: string;
  typeSpeed: number;
  darkSelector: string;
  uiStyle: string;
  fixedTone: string;
  fixedDensity: string;
  themeName: string;
  theme: SummaryTheme | string;
  typewriter: boolean;
}

export interface SummaryContentResponse {
  summaryContent?: string;
}

export const SUMMARY_API_BASE = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1';

export const DEFAULT_SUMMARY_THEME: SummaryTheme = {
  bg: '#f7f9fe',
  main: '#4F8DFD',
  contentFontSize: '16px',
  title: '#3A5A8C',
  content: '#222',
  gptName: '#7B88A8',
  contentBg: '#fff',
  border: '#e3e8f7',
  shadow: '0 2px 12px 0 rgba(60,80,180,0.08)',
  tagBg: '#f0f4ff',
  tagColor: '#4F8DFD',
  cursor: '#4F8DFD',
};

export const DEFAULT_SUMMARY_CONFIG: SummaryWidgetConfig = {
  logo: 'icon.svg',
  summaryTitle: '文章摘要',
  gptName: '智阅GPT',
  typeSpeed: 20,
  darkSelector: '',
  uiStyle: 'classic',
  fixedTone: 'violet',
  fixedDensity: 'compact',
  themeName: 'custom',
  theme: DEFAULT_SUMMARY_THEME,
  typewriter: true,
};

export function parseTheme(theme: SummaryTheme | string | null | undefined): SummaryTheme {
  if (!theme) {
    return { ...DEFAULT_SUMMARY_THEME };
  }

  if (typeof theme === 'string') {
    try {
      const parsed = JSON.parse(theme) as SummaryTheme;
      return { ...DEFAULT_SUMMARY_THEME, ...parsed };
    } catch {
      return { ...DEFAULT_SUMMARY_THEME };
    }
  }

  return { ...DEFAULT_SUMMARY_THEME, ...theme };
}

export function matchesDarkSelector(selector: string): boolean {
  if (!selector) {
    return false;
  }

  const html = document.documentElement;
  const body = document.body;

  const dataAttrMatch = selector.match(/^data-([\w-]+)=(.+)$/);
  if (dataAttrMatch) {
    const attribute = `data-${dataAttrMatch[1]}`;
    const value = dataAttrMatch[2];
    return html.getAttribute(attribute) === value || body.getAttribute(attribute) === value;
  }

  const classMatch = selector.match(/^class=(.+)$/);
  if (classMatch) {
    const className = classMatch[1];
    return html.classList.contains(className) || body.classList.contains(className);
  }

  return html.classList.contains(selector) || body.classList.contains(selector);
}

export function buildThemeObserver(
  selector: string,
  callback: () => void,
): MutationObserver[] {
  if (!selector) {
    return [];
  }

  const html = document.documentElement;
  const body = document.body;

  const dataAttrMatch = selector.match(/^data-([\w-]+)=(.+)$/);
  const observerConfig: MutationObserverInit = {
    attributes: true,
    attributeFilter: ['class'],
  };

  if (dataAttrMatch) {
    observerConfig.attributeFilter = ['class', `data-${dataAttrMatch[1]}`];
  }

  const htmlObserver = new MutationObserver(callback);
  const bodyObserver = new MutationObserver(callback);

  htmlObserver.observe(html, observerConfig);
  bodyObserver.observe(body, observerConfig);

  return [htmlObserver, bodyObserver];
}

export async function fetchSummaryConfig(): Promise<SummaryWidgetConfig> {
  try {
    const response = await fetch(`${SUMMARY_API_BASE}/summaryConfig`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as Partial<SummaryWidgetConfig>;
    return {
      ...DEFAULT_SUMMARY_CONFIG,
      ...data,
      theme: data.theme ?? DEFAULT_SUMMARY_CONFIG.theme,
    };
  } catch {
    return { ...DEFAULT_SUMMARY_CONFIG };
  }
}

export async function fetchSummaryContent(postName: string): Promise<SummaryContentResponse> {
  const response = await fetch(`${SUMMARY_API_BASE}/updateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postName,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return (await response.json()) as SummaryContentResponse;
}

export function resolveLogoUrl(logo: string): string {
  if (!logo) {
    return '';
  }

  if (
    logo.startsWith('http://') ||
    logo.startsWith('https://') ||
    logo.startsWith('/') ||
    logo.startsWith('data:')
  ) {
    return logo;
  }

  return `/plugins/summaraidGPT/assets/static/${logo}`;
}
