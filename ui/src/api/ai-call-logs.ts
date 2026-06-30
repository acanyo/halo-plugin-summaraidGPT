import { axiosInstance } from '@halo-dev/api-client'

const API_PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface Metadata {
  name: string
  creationTimestamp?: string
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
  limit?: number
  operation?: string
  modelType?: string
  success?: boolean
}

export const aiCallLogApi = {
  async list(params: ListAiCallLogsParams = {}) {
    const { data } = await axiosInstance.get<{ items: AiCallLog[] }>(
      `${API_PREFIX}/aiCallLogs`,
      { params },
    )
    return data.items || []
  },

  async delete(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/aiCallLogs/${name}`)
  },
}
