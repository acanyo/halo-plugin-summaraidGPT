import { axiosInstance } from '@halo-dev/api-client'
import { AxiosError } from 'axios'

const API_PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface Metadata {
  name: string
  creationTimestamp?: string
  deletionTimestamp?: string
}

export interface RagKnowledgeBase {
  metadata: Metadata
  spec?: {
    displayName?: string
    description?: string
    enabled?: boolean
    sourceTypes?: string[]
  }
  status?: {
    indexState?: string
    documentCount?: number
    chunkCount?: number
    embeddingModelName?: string
    embeddingDimensions?: number
    indexVersion?: string
    indexDurationMillis?: number
    lastIndexedAt?: string
    errorMessage?: string
  }
}

export interface RagDocument {
  metadata: Metadata
  spec?: {
    knowledgeBase?: string
    sourceType?: string
    sourceName?: string
    title?: string
    url?: string
    content?: string
    contentHash?: string
    enabled?: boolean
    tags?: string[]
    categories?: string[]
  }
  status?: {
    lastImportedAt?: string
    lastIndexedAt?: string
    chunkCount?: number
    errorMessage?: string
  }
}

export interface RagStats {
  knowledgeBase: string
  totalDocuments: number
  enabledDocuments: number
  disabledDocuments: number
  postDocuments: number
  manualDocuments: number
  chunkCount: number
  staleDocuments: number
  needsRebuild: boolean
}

export interface RagImportablePost {
  postName: string
  title?: string
  url?: string
  imported: boolean
  documentName?: string
  lastImportedAt?: string
  chunkCount?: number
}

export interface RagSearchResult {
  id: string
  knowledgeBase?: string
  documentName?: string
  sourceType?: string
  sourceName?: string
  title?: string
  url?: string
  content?: string
  chunkIndex?: number
  score?: number
  vectorScore?: number
  keywordScore?: number
  rerankScore?: number
  metadata?: Record<string, unknown>
}

export interface RagSourceReference {
  id: string
  documentName?: string
  sourceName?: string
  sourceType?: string
  title?: string
  url?: string
  score?: number
  chunkCount?: number
  chunkIndexes?: string[]
  sourceIds?: string[]
  content?: string
  metadata?: Record<string, unknown>
}

export interface RagConversationMessage {
  id?: string
  role?: 'user' | 'assistant' | string
  content?: string
  createdAt?: string
  sources?: RagSourceReference[]
  error?: boolean
}

export interface RagConversation {
  metadata: Metadata
  spec?: {
    knowledgeBase?: string
    visitorId?: string
    title?: string
    userAgent?: string
    messages?: RagConversationMessage[]
  }
  status?: {
    messageCount?: number
    userMessageCount?: number
    assistantMessageCount?: number
    totalInputChars?: number
    totalOutputChars?: number
    createdAt?: string
    lastMessageAt?: string
    lastUserMessageAt?: string
    lastAssistantMessageAt?: string
  }
}

export interface RagConversationPage {
  items: RagConversation[]
  page: number
  size: number
  total: number
}

export interface SaveKnowledgeBaseRequest {
  name: string
  displayName: string
  description?: string
  enabled?: boolean
  sourceTypes?: string[]
}

export interface SaveDocumentRequest {
  name?: string
  knowledgeBase: string
  sourceType?: string
  sourceName?: string
  title: string
  url?: string
  content: string
  enabled?: boolean
  tags?: string[]
  categories?: string[]
}

export interface RagIndexSummary {
  documentCount: number
  chunkCount: number
  embeddingDimensions: number
  indexVersion: string
  durationMillis: number
}

export type RagIndexTaskPhase = 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED'

export interface RagIndexTask {
  metadata: Metadata
  spec?: {
    taskType?: string
    knowledgeBase?: string
    documentName?: string
  }
  status?: {
    phase?: RagIndexTaskPhase | string
    progress?: number
    message?: string
    summary?: RagIndexSummary
    errorMessage?: string
    startedAt?: string
    completedAt?: string
  }
}

export interface RagImportResponse {
  knowledgeBase: string
  imported: number
  summary?: RagIndexSummary
  task?: RagIndexTask
}

export interface RagMutationResponse {
  affected: number
  summary?: RagIndexSummary
}

export interface RagRebuildTaskResponse {
  knowledgeBase: string
  task: RagIndexTask
}

export interface RagChatStreamEvent {
  type?: 'conversation' | 'sources' | 'delta' | 'done' | 'error' | string
  delta?: string
  sources?: RagSourceReference[]
  error?: string
  conversationId?: string
}

export interface RagAskStreamHandlers {
  onConversationId?: (conversationId: string) => void
  onSources?: (sources: RagSourceReference[]) => void
  onDelta?: (delta: string) => void
  onDone?: () => void
  onError?: (error: string) => void
}

export const ragApi = {
  async listKnowledgeBases() {
    const { data } = await axiosInstance.get<{ items: RagKnowledgeBase[] }>(
      `${API_PREFIX}/ragKnowledgeBases`,
    )
    return data.items || []
  },

  async saveKnowledgeBase(payload: SaveKnowledgeBaseRequest) {
    const { data } = await axiosInstance.post<RagKnowledgeBase>(
      `${API_PREFIX}/ragKnowledgeBases`,
      payload,
    )
    return data
  },

  async deleteKnowledgeBase(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/ragKnowledgeBases/${name}`)
  },

  async listDocuments(params: { knowledgeBase: string; keyword?: string; sourceType?: string }) {
    const { data } = await axiosInstance.get<{ items: RagDocument[] }>(
      `${API_PREFIX}/ragDocuments`,
      { params },
    )
    return data.items || []
  },

  async stats(knowledgeBase: string) {
    const { data } = await axiosInstance.get<RagStats>(`${API_PREFIX}/ragStats`, {
      params: { knowledgeBase },
    })
    return data
  },

  async listImportablePosts(params: { knowledgeBase: string; keyword?: string }) {
    const { data } = await axiosInstance.get<{ items: RagImportablePost[] }>(
      `${API_PREFIX}/ragImportablePosts`,
      { params },
    )
    return data.items || []
  },

  async saveDocument(payload: SaveDocumentRequest) {
    const { data } = await axiosInstance.post<RagDocument>(`${API_PREFIX}/ragDocuments`, payload)
    return data
  },

  async deleteDocument(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/ragDocuments/${name}`)
  },

  async batchDeleteDocuments(payload: {
    names: string[]
    rebuildAfterMutation?: boolean
  }) {
    const { data } = await axiosInstance.post<RagMutationResponse>(
      `${API_PREFIX}/ragDocumentsBatchDelete`,
      payload,
    )
    return data
  },

  async updateDocumentStatus(
    name: string,
    payload: { enabled: boolean; rebuildAfterMutation?: boolean },
  ) {
    const { data } = await axiosInstance.post<{
      document: RagDocument
      summary?: RagIndexSummary
    }>(`${API_PREFIX}/ragDocuments/${name}/status`, payload)
    return data
  },

  async importPosts(
    knowledgeBase: string,
    postNames: string[] = [],
    options?: { rebuildAfterImport?: boolean },
  ) {
    const { data } = await axiosInstance.post<RagImportResponse>(
      `${API_PREFIX}/ragImportPosts`,
      { knowledgeBase, postNames, rebuildAfterImport: options?.rebuildAfterImport },
    )
    return data
  },

  async rebuild(knowledgeBase: string) {
    const { data } = await axiosInstance.post<RagRebuildTaskResponse>(
      `${API_PREFIX}/ragRebuild`,
      { knowledgeBase },
    )
    return data
  },

  async rebuildNow(knowledgeBase: string) {
    const { data } = await axiosInstance.post<{ knowledgeBase: string; summary: RagIndexSummary }>(
      `${API_PREFIX}/ragRebuildNow`,
      { knowledgeBase },
    )
    return data
  },

  async listIndexTasks(knowledgeBase: string, limit = 20) {
    const { data } = await axiosInstance.get<{ items: RagIndexTask[] }>(
      `${API_PREFIX}/ragIndexTasks`,
      { params: { knowledgeBase, limit } },
    )
    return data.items || []
  },

  async latestIndexTask(knowledgeBase: string) {
    try {
      const { data, status } = await axiosInstance.get<RagIndexTask | undefined>(
        `${API_PREFIX}/ragIndexTasks/latest`,
        {
          params: { knowledgeBase },
        },
      )
      if (status === 204 || !data) {
        return undefined
      }
      return data
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return undefined
      }
      throw error
    }
  },

  subscribeIndexTask(
    name: string,
    onTask: (task: RagIndexTask) => void,
    onError?: (event: Event) => void,
  ) {
    const source = new EventSource(
      `${API_PREFIX}/ragIndexTasks/${encodeURIComponent(name)}/subscribe`,
    )
    source.addEventListener('task', (event) => {
      onTask(JSON.parse((event as MessageEvent<string>).data) as RagIndexTask)
    })
    source.onerror = (event) => {
      onError?.(event)
    }
    return source
  },

  async search(payload: { knowledgeBase: string; query: string; limit?: number }) {
    const { data } = await axiosInstance.post<{ results: RagSearchResult[] }>(
      `${API_PREFIX}/ragSearch`,
      payload,
    )
    return data.results || []
  },

  async ask(payload: { knowledgeBase: string; question: string; limit?: number }) {
    const { data } = await axiosInstance.post<{
      answer: string
      sources: RagSourceReference[]
    }>(`${API_PREFIX}/ragAsk`, payload)
    return data
  },

  async listConversations(params: {
    knowledgeBase?: string
    keyword?: string
    page?: number
    size?: number
  }) {
    const { data } = await axiosInstance.get<RagConversationPage>(`${API_PREFIX}/ragConversations`, {
      params,
    })
    return {
      items: data.items || [],
      page: data.page || params.page || 1,
      size: data.size || params.size || 20,
      total: data.total || 0,
    }
  },

  async getConversation(name: string, visitorId: string) {
    const { data } = await axiosInstance.get<RagConversation>(
      `${API_PREFIX}/ragConversations/${name}`,
      { params: { visitorId } },
    )
    return data
  },

  async deleteConversation(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/ragConversations/${name}`)
  },

  async askStream(
    payload: { knowledgeBase: string; question: string; limit?: number; conversationId?: string; visitorId?: string },
    handlers: RagAskStreamHandlers,
    signal?: AbortSignal,
  ) {
    const response = await fetch(`${API_PREFIX}/ragAskStream`, {
      method: 'POST',
      credentials: 'same-origin',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok || !response.body) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    const dispatch = (frame: string) => {
      const data = parseSseFrame(frame)
      if (!data) {
        return
      }

      const event = JSON.parse(data) as RagChatStreamEvent
      if (event.type === 'conversation') {
        if (event.conversationId) {
          handlers.onConversationId?.(event.conversationId)
        }
      } else if (event.type === 'sources') {
        handlers.onSources?.(event.sources || [])
      } else if (event.type === 'delta') {
        handlers.onDelta?.(event.delta || '')
      } else if (event.type === 'done') {
        handlers.onDone?.()
      } else if (event.type === 'error') {
        handlers.onError?.(event.error || 'RAG 问答失败')
      }
    }

    for (;;) {
      const { done, value } = await reader.read()
      if (done) {
        buffer += decoder.decode()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() || ''
      frames.forEach(dispatch)
    }

    if (buffer.trim()) {
      dispatch(buffer)
    }
  },
}

const parseSseFrame = (frame: string) => {
  const dataLines = frame
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.replace(/^data:\s?/, ''))

  return dataLines.length ? dataLines.join('\n') : undefined
}
