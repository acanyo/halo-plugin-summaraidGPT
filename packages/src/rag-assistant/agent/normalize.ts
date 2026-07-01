import type {
  AgentBrowserAction,
  AgentCommentCapability,
  AgentRuntimeConfig,
  AgentToolApproval,
  AgentToolAuth,
  AgentToolConfig,
} from './types';

const ACTION_TYPES = new Set(['navigate', 'scroll-to', 'highlight', 'dispatch-event', 'registered']);
const TOOL_NAME_PATTERN = /^[a-z][a-z0-9_]{2,63}$/;

export function normalizeAgentRuntimeConfig(input: unknown): AgentRuntimeConfig {
  const source = isRecord(input) ? input : {};
  const builtIn = isRecord(source.builtIn) ? source.builtIn : {};
  const toolSecurity = isRecord(source.toolSecurity) ? source.toolSecurity : {};
  const haloSearch = isRecord(source.haloSearch) ? source.haloSearch : {};
  const haloResourceDetail = isRecord(source.haloResourceDetail) ? source.haloResourceDetail : {};
  const ragSearch = isRecord(source.ragSearch) ? source.ragSearch : {};
  const allowedTypes = normalizeStringArray(haloSearch.allowedTypes);

  return {
    enabled: pickBoolean(source.enabled, true) ?? true,
    builtIn: {
      pageContext: pickBoolean(builtIn.pageContext, true) ?? true,
      haloNavigation: pickBoolean(builtIn.haloNavigation, true) ?? true,
      haloContentSearch: pickBoolean(builtIn.haloContentSearch, true) ?? true,
      ragContentSearch: pickBoolean(builtIn.ragContentSearch, true) ?? true,
      networkAccess: pickBoolean(builtIn.networkAccess, false) ?? false,
      commentCapability: pickCommentCapability(builtIn.commentCapability),
    },
    aiTools: normalizeToolList(source.aiTools),
    toolSecurity: {
      allowedExternalOrigins: [
        ...normalizeStringArray(toolSecurity.allowedExternalOrigins),
        ...normalizeObjectStringArray(toolSecurity.allowedExternalOrigins, 'origin'),
      ],
      allowNewTab: pickBoolean(toolSecurity.allowNewTab, false) ?? false,
    },
    haloSearch: {
      allowedTypes: allowedTypes.length ? allowedTypes : ['post.content.halo.run', 'singlepage.content.halo.run'],
      defaultLimit: pickNumber(haloSearch.defaultLimit) ?? 5,
    },
    haloResourceDetail: {
      maxContentChars: pickNumber(haloResourceDetail.maxContentChars) ?? 3000,
    },
    ragSearch: {
      defaultLimit: pickNumber(ragSearch.defaultLimit) ?? 5,
      maxContentChars: pickNumber(ragSearch.maxContentChars) ?? 3000,
    },
  };
}

function normalizeToolList(value: unknown): AgentToolConfig[] {
  if (typeof value === 'string' && value.trim()) {
    try {
      return normalizeToolList(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((tool) => {
    const normalized = normalizeTool(tool);
    return normalized ? [normalized] : [];
  });
}

function normalizeTool(value: unknown): AgentToolConfig | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const name = pickString(value.name);
  const description = pickString(value.description);
  const action = normalizeAction(value.action);
  if (!name || !TOOL_NAME_PATTERN.test(name) || !description || !action) {
    return undefined;
  }
  return {
    name,
    description,
    inputSchema: isRecord(value.inputSchema) ? value.inputSchema : { type: 'object', properties: {} },
    approval: pickApproval(value.approval),
    requiredAuth: pickAuth(value.requiredAuth),
    actionType: action.type,
    action,
    testInput: value.testInput,
  };
}

function normalizeAction(value: unknown): AgentBrowserAction | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const type = pickString(value.type);
  if (!type || !ACTION_TYPES.has(type)) {
    return undefined;
  }
  if (type === 'navigate') {
    const url = pickString(value.url);
    return url
      ? { ...pickMessages(value), type, url, target: value.target === '_blank' ? '_blank' : '_self' }
      : undefined;
  }
  if (type === 'scroll-to' || type === 'highlight') {
    const selector = pickString(value.selector);
    if (!selector) {
      return undefined;
    }
    return type === 'scroll-to'
      ? { ...pickMessages(value), type, selector, behavior: value.behavior === 'auto' ? 'auto' : 'smooth' }
      : { ...pickMessages(value), type, selector, duration: pickNumber(value.duration) };
  }
  if (type === 'dispatch-event') {
    const event = pickString(value.event);
    return event ? { ...pickMessages(value), type, event } : undefined;
  }
  return { ...pickMessages(value), type: 'registered' };
}

function pickMessages(value: Record<string, unknown>) {
  return {
    pendingMessage: pickString(value.pendingMessage),
    successMessage: pickString(value.successMessage),
    errorMessage: pickString(value.errorMessage),
  };
}

function pickApproval(value: unknown): AgentToolApproval {
  return value === 'never' || value === 'always' ? value : 'default';
}

function pickAuth(value: unknown): AgentToolAuth {
  return value === 'authenticated' ? 'authenticated' : 'none';
}

function pickCommentCapability(value: unknown): AgentCommentCapability {
  return value === 'off' || value === 'submit' ? value : 'assist';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function normalizeObjectStringArray(value: unknown, objectKey: string): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((item) => (isRecord(item) && typeof item[objectKey] === 'string' && item[objectKey].trim()
    ? [item[objectKey]]
    : []));
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function pickNumber(value: unknown): number | undefined {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
