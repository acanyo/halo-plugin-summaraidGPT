import { axiosInstance } from '@halo-dev/api-client'
import axios from 'axios'

const API_PREFIX = '/apis/api.summary.summaraidgpt.lik.cc/v1alpha1'

export interface Metadata {
  name: string
  creationTimestamp?: string
  deletionTimestamp?: string
}

export interface PetCompanion {
  metadata: Metadata
  spec?: {
    displayName?: string
    description?: string
    source?: string
    petdexId?: string
    installCommand?: string
    installScriptUrl?: string
    petJsonUrl?: string
    spritesheetUrl?: string
    enabled?: boolean
    active?: boolean
  }
  status?: {
    importedAt?: string
    updatedAt?: string
    errorMessage?: string
  }
}

export interface SavePetCompanionRequest {
  name?: string
  displayName: string
  description?: string
  source?: string
  petdexId?: string
  installCommand?: string
  installScriptUrl?: string
  petJsonUrl?: string
  spritesheetUrl: string
  enabled?: boolean
  active?: boolean
}

export interface ImportPetCompanionRequest {
  command: string
  enabled?: boolean
  active?: boolean
}

export interface PetdexCatalogItem {
  slug: string
  displayName: string
  kind?: string
  submittedBy?: string
  installScriptUrl: string
  spritesheetUrl: string
  petJsonUrl: string
  zipUrl?: string
}

export interface PetdexCatalogResponse {
  generatedAt?: string
  total: number
  items: PetdexCatalogItem[]
}

export const petApi = {
  async list() {
    const { data } = await axiosInstance.get<{ items: PetCompanion[] }>(
      `${API_PREFIX}/petCompanions`,
    )
    return data.items || []
  },

  async save(payload: SavePetCompanionRequest) {
    const { data } = await axiosInstance.post<PetCompanion>(`${API_PREFIX}/petCompanions`, payload)
    return data
  },

  async importFromPetdex(payload: ImportPetCompanionRequest) {
    const { data } = await axiosInstance.post<PetCompanion>(
      `${API_PREFIX}/petCompanions/import`,
      payload,
    )
    return data
  },

  async listPetdexCatalog() {
    const { data } = await axiosInstance.get<PetdexCatalogResponse>(
      `${API_PREFIX}/petCompanions/petdex`,
    )
    return data
  },

  async setActive(name: string) {
    const { data } = await axiosInstance.post<PetCompanion>(
      `${API_PREFIX}/petCompanions/${encodeURIComponent(name)}/active`,
    )
    return data
  },

  async updateStatus(name: string, enabled: boolean) {
    const { data } = await axiosInstance.post<PetCompanion>(
      `${API_PREFIX}/petCompanions/${encodeURIComponent(name)}/status`,
      { enabled },
    )
    return data
  },

  async delete(name: string) {
    await axiosInstance.delete(`${API_PREFIX}/petCompanions/${encodeURIComponent(name)}`)
  },

  errorMessage(error: unknown, fallback: string) {
    if (!axios.isAxiosError(error)) {
      return fallback
    }
    const data = error.response?.data as { message?: string } | undefined
    return data?.message || `${fallback}（${error.response?.status || '未知错误'}）`
  },
}
