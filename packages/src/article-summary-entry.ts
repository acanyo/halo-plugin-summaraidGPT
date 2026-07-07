import './article-summary/widget';
import './article-reading/widget';
import {
  fetchSummaryConfig,
  fetchSummaryContent,
  type SummaryWidgetConfig,
} from './article-summary/shared';
import type { ArticleSummaryWidget } from './article-summary/widget';
import type { ArticleReadingWidget } from './article-reading/widget';

declare global {
  interface Window {
    likcc_summaraidGPT_scriptLoaded?: boolean;
    likcc_summaraidGPT_initSummaryBox?: (
      userConfig?: Partial<SummaryWidgetConfig>,
    ) => Promise<(ArticleSummaryWidget | ArticleReadingWidget)[]>;
    likcc_summaraidGPT_reinit?: (
      userConfig?: Partial<SummaryWidgetConfig>,
    ) => Promise<(ArticleSummaryWidget | ArticleReadingWidget)[]>;
    swup?: {
      hooks?: {
        on: (event: string, handler: () => void) => void;
      };
    };
  }
}

const SUMMARY_WIDGET_SELECTOR = 'ai-summaraidGPT';
const SUMMARY_DATA_SELECTOR = 'ai-summaraidGPT-data';
const SUMMARY_COMPONENT_TAG = 'likcc-article-summary';
const READING_WIDGET_SELECTOR = 'ai-summaraidGPT-reading';
const READING_COMPONENT_TAG = 'likcc-article-reading';
const PROCESSED_DATA_ATTR = 'data-summary-lit-mounted';
const PROCESSED_SILENT_ATTR = 'data-summary-silent-processed';
let initTimer: number | undefined;
let domObserver: MutationObserver | undefined;

function printBanner(): void {
  if (window.likcc_summaraidGPT_scriptLoaded) {
    return;
  }

  console.log('%c智阅GPT-智能AI助手', 'color: #4F8DFD; font-size: 16px; font-weight: bold;');
  console.log('%c智阅点睛，一键洞见——基于AI大模型的Halo智能AI助手', 'color: #666; font-size: 12px;');
  console.log('%c作者: Handsome | 网站: https://lik.cc', 'color: #999; font-size: 11px;');
  window.likcc_summaraidGPT_scriptLoaded = true;
}

function applyConfig(
  element: ArticleSummaryWidget,
  config: Partial<SummaryWidgetConfig>,
  source: Element,
): void {
  element.postName = source.getAttribute('name') || '';
  element.logo = config.logo || '';
  element.summaryTitle = config.summaryTitle || '文章摘要';
  element.gptName = config.gptName || '智阅GPT';
  element.typeSpeed = config.typeSpeed ?? 20;
  element.typewriter = config.typewriter ?? true;
  element.darkSelector = config.darkSelector || '';
  element.uiStyle = config.uiStyle || 'simple';
  element.fixedTone = config.fixedTone || 'violet';
  element.fixedDensity = config.fixedDensity || 'compact';
  element.themeName = config.themeName || 'custom';
  element.theme = config.theme || {};
}

function applyReadingConfig(
  element: ArticleReadingWidget,
  config: Partial<SummaryWidgetConfig>,
  source: Element,
): void {
  element.postName = source.getAttribute('name') || '';
  element.darkSelector = config.darkSelector || '';
}

async function mountSummaryWidgets(
  userConfig: Partial<SummaryWidgetConfig> = {},
): Promise<(ArticleSummaryWidget | ArticleReadingWidget)[]> {
  const widgets = Array.from(
    document.querySelectorAll<HTMLElement>(
      `${SUMMARY_WIDGET_SELECTOR}:not([${PROCESSED_DATA_ATTR}="true"])`,
    ),
  );
  const readingWidgets = Array.from(
    document.querySelectorAll<HTMLElement>(
      `${READING_WIDGET_SELECTOR}:not([${PROCESSED_DATA_ATTR}="true"])`,
    ),
  );

  if (widgets.length === 0 && readingWidgets.length === 0) {
    return [];
  }

  const apiConfig = await fetchSummaryConfig();
  const config = { ...apiConfig, ...userConfig };

  const summaries = widgets.map((widget) => {
    const summary = document.createElement(SUMMARY_COMPONENT_TAG) as ArticleSummaryWidget;
    applyConfig(summary, config, widget);
    widget.setAttribute(PROCESSED_DATA_ATTR, 'true');
    widget.replaceWith(summary);
    return summary;
  });

  const readings = readingWidgets.map((widget) => {
    const reading = document.createElement(READING_COMPONENT_TAG) as ArticleReadingWidget;
    applyReadingConfig(reading, config, widget);
    widget.setAttribute(PROCESSED_DATA_ATTR, 'true');
    widget.replaceWith(reading);
    return reading;
  });

  return [...summaries, ...readings];
}

async function fetchSummaryContentSilent(): Promise<void> {
  const dataWidgets = Array.from(
    document.querySelectorAll<HTMLElement>(
      `${SUMMARY_DATA_SELECTOR}:not([${PROCESSED_SILENT_ATTR}="true"])`,
    ),
  );

  await Promise.all(
    dataWidgets.map(async (widget) => {
      const postName = widget.getAttribute('name');
      if (!postName) {
        return;
      }

      widget.setAttribute(PROCESSED_SILENT_ATTR, 'true');

      try {
        await fetchSummaryContent(postName);
      } catch (error) {
        console.warn('摘要入库失败:', error);
      }
    }),
  );
}

async function autoInitSummaryBox(): Promise<void> {
  const widgets = document.querySelectorAll(SUMMARY_WIDGET_SELECTOR);
  const readingWidgets = document.querySelectorAll(READING_WIDGET_SELECTOR);
  const dataWidgets = document.querySelectorAll(SUMMARY_DATA_SELECTOR);
  const mountedSummary = document.querySelector(SUMMARY_COMPONENT_TAG);

  if (widgets.length > 0 || readingWidgets.length > 0) {
    await mountSummaryWidgets();
    return;
  }

  if (dataWidgets.length > 0 && !mountedSummary) {
    await fetchSummaryContentSilent();
  }
}

function scheduleAutoInit(): void {
  if (initTimer) {
    window.clearTimeout(initTimer);
  }

  initTimer = window.setTimeout(() => {
    initTimer = undefined;
    void autoInitSummaryBox();
  }, 0);
}

function shouldHandleMutation(mutation: MutationRecord): boolean {
  if (mutation.type !== 'childList') {
    return false;
  }

  const addedNodes = Array.from(mutation.addedNodes);
  return addedNodes.some((node) => {
    if (!(node instanceof Element)) {
      return false;
    }

    return (
      node.matches(SUMMARY_WIDGET_SELECTOR) ||
      node.matches(SUMMARY_DATA_SELECTOR) ||
      node.matches(READING_WIDGET_SELECTOR) ||
      node.querySelector(SUMMARY_WIDGET_SELECTOR) !== null ||
      node.querySelector(SUMMARY_DATA_SELECTOR) !== null ||
      node.querySelector(READING_WIDGET_SELECTOR) !== null
    );
  });
}

function observeDomChanges(): void {
  if (domObserver) {
    return;
  }

  domObserver = new MutationObserver((mutations) => {
    if (mutations.some(shouldHandleMutation)) {
      scheduleAutoInit();
    }
  });

  domObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function bindNavigationEvents(): void {
  const eventNames = [
    'pjax:success',
    'pjax:complete',
    'swup:content-replaced',
    'swup:page:view',
    'swup:animation:in:end',
  ];

  eventNames.forEach((eventName) => {
    document.addEventListener(eventName, scheduleAutoInit);
  });

  window.swup?.hooks?.on?.('page:view', scheduleAutoInit);
  window.swup?.hooks?.on?.('content:replace', scheduleAutoInit);
}

printBanner();

window.likcc_summaraidGPT_initSummaryBox = mountSummaryWidgets;
window.likcc_summaraidGPT_reinit = mountSummaryWidgets;
observeDomChanges();
bindNavigationEvents();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    scheduleAutoInit();
  }, { once: true });
} else {
  scheduleAutoInit();
}
