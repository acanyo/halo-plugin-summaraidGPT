import { isAxiosError } from 'axios'

export function workbenchErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined
    return data?.detail || data?.message || fallback
  }
  return error instanceof Error ? error.message : fallback
}
