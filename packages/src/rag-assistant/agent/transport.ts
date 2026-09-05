import {
  DefaultChatTransport,
  type UIMessageChunk,
} from '@halo-dev/ai-foundation-sdk';

const TOOL_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

export class AgentChatTransport extends DefaultChatTransport {
  protected override async *processResponse(response: Response): AsyncIterable<UIMessageChunk> {
    // Providers may omit the name after the first event of the same tool call.
    const toolNames = new Map<string, string>();
    const traceId = response.headers.get('X-SummaraidGPT-Trace-Id');
    let eventIndex = 0;

    for await (const chunk of super.processResponse(response)) {
      eventIndex += 1;
      if (!chunk?.type?.startsWith('tool-')) {
        yield chunk;
        continue;
      }

      const toolChunk = chunk as UIMessageChunk & { toolName?: unknown; toolCallId?: unknown };
      const callId = typeof toolChunk.toolCallId === 'string' ? toolChunk.toolCallId : '';
      const previousName = toolNames.get(callId);
      const nameMissing = toolChunk.toolName == null
        || (typeof toolChunk.toolName === 'string' && !toolChunk.toolName.trim());
      const toolName = nameMissing ? previousName : toolChunk.toolName;
      const details = {
        eventType: chunk.type,
        eventIndex,
        toolName: toolChunk.toolName,
        toolCallId: toolChunk.toolCallId,
        previousName,
        traceId,
      };

      if (toolName == null) {
        throw new AgentToolStreamError('missing-name', details);
      }
      if (typeof toolName !== 'string' || !TOOL_NAME_PATTERN.test(toolName)) {
        throw new AgentToolStreamError('invalid-name', details);
      }
      if (previousName && previousName !== toolName) {
        throw new AgentToolStreamError('conflicting-name', details);
      }

      if (callId.trim()) {
        toolNames.set(callId, toolName);
      }
      yield { ...chunk, toolName } as UIMessageChunk;
    }
  }
}

interface ToolStreamErrorDetails {
  eventType: string;
  eventIndex: number;
  toolName: unknown;
  toolCallId: unknown;
  previousName?: string;
  traceId: string | null;
}

type ToolStreamErrorReason = 'missing-name' | 'invalid-name' | 'conflicting-name';

export class AgentToolStreamError extends Error {
  readonly reason: ToolStreamErrorReason;
  readonly details: ToolStreamErrorDetails;

  constructor(reason: ToolStreamErrorReason, details: ToolStreamErrorDetails) {
    const explanations: Record<ToolStreamErrorReason, string> = {
      'missing-name': '工具调用事件缺少 toolName，且没有同一调用的已知工具名可供补全。',
      'invalid-name': '工具名格式无效：必须以英文字母开头，后续只能包含字母、数字、下划线或连字符。',
      'conflicting-name': '同一个 toolCallId 返回了不同的工具名，已停止本次调用。',
    };
    super([
      `Agent 工具调用协议异常：${explanations[reason]}`,
      `事件：${displayValue(details.eventType)}（第 ${details.eventIndex} 个）`,
      `工具名：${displayValue(details.toolName)}`,
      `调用 ID：${displayValue(details.toolCallId)}`,
      ...(details.previousName ? [`此前工具名：${displayValue(details.previousName)}`] : []),
      ...(details.traceId ? [`追踪 ID：${displayValue(details.traceId)}`] : []),
      '请站长检查模型的工具调用输出及 AI Foundation 版本，结合服务端日志排查。',
    ].join('\n'));
    this.name = 'AgentToolStreamError';
    this.reason = reason;
    this.details = details;
  }
}

function displayValue(value: unknown): string {
  if (value == null) {
    return '（缺失）';
  }
  if (typeof value !== 'string') {
    return `（类型错误：${typeof value}）`;
  }
  return JSON.stringify(value.length > 160 ? `${value.slice(0, 160)}...` : value);
}
