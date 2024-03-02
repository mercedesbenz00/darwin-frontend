import { UserPayload } from '@/store/types'

type UserPayloadBuildParams = Partial<UserPayload>

export const buildUserPayload = (params: UserPayloadBuildParams = {}): UserPayload => ({
  id: -1,
  first_name: '',
  last_name: '',
  email: '',
  inserted_at: '',
  show_notifications: true,
  image: null,
  tutorial_seen: false,
  superuser: false,
  two_factor_auth_enabled: false,
  two_factor_required: false,
  ...params
})
