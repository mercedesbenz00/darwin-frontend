import { ImagePayload } from './ImagePayload'

export type UserPayload = {
  /* eslint-disable camelcase */
  email: string
  first_name: string
  id: number
  inserted_at: string
  last_name: string
  show_notifications: boolean
  image: ImagePayload | null
  tutorial_seen: boolean
  superuser: boolean
  two_factor_auth_enabled: boolean
  two_factor_required: boolean
  /* eslint-enable camelcase */
}
