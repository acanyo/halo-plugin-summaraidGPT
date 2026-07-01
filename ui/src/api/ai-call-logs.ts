import { axiosInstance } from '@halo-dev/api-client'

const API_PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface Metadata {
  name: string
  creationTimestamp?: string
  deletionTimestamp?: string
}

export interface AiCallLog {
  metadata: Metadata
  spec?: {
    provider?: string
    operation?: string
    modelType?: string
    modelName?: string
    success?: boolean
    startedAt?: string
    durationMillis?: number
    inputCount?: number
    inputChars?: number
    maxInputChars?: number
    outputCount?: number
    outputChars?: number
    maxOutputChars?: number
    candidateCount?: number
    sourceCount?: number
    errorType?: string
    errorMessage?: string
    metadata?: Record<string, string>
  }
}

export interface ListAiCallLogsParams {
  page?: number
  size?: number
  operation?: string
  modelType?: string
  success?: boolean
}

export interface AiCallLogPage {
  items: AiCallLog[]
  page: number
  size: number
  total: number
}

export interface AiCallLogMutationResponse {
  success: boolean
  message?: string
  affected?: number
}

export const aiCallLogApi = {
  async list(params: ListAiCallLogsParams = {}) {
    const { data } = await axiosInstance.get<AiCallLogPage>(`${API_PREFIX}/aiCallLogs`, { params })
    return {
      items: data.items || [],
      page: data.page || params.page || 1,
      size: data.size || params.size || 20,
      total: data.total || 0,
    }
  },

  async delete(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/aiCallLogs/${name}`)
  },

  async clear() {
    const { data } = await axiosInstance.delete<AiCallLogMutationResponse>(
      `${API_PREFIX}/aiCallLogs`,
    )
    return data
  },
}
