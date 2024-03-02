import { useStore } from '@/composables'
import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'

export const useAuth = (): { isAuthorized: IsAuthorized } => {
  const { getters } = useStore()
  const isAuthorized: IsAuthorized = getters['auth/isAuthorized']
  return { isAuthorized }
}
