import { utils } from '@halo-dev/ui-shared'

export const hasUiPermission = (permission: string) => {
  try {
    return utils.permission.has([permission])
  } catch {
    return false
  }
}
