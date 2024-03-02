import { ImagePayload } from '@/store/types/ImagePayload'

import { MembershipPayload } from './MembershipPayload'

export type TeamPayload = {
  /* eslint-disable camelcase */
  clients: TeamPayload[]
  disable_dataset_sharing: boolean
  disabled: boolean
  enforcing_two_factor_auth_allowed: boolean
  id: number
  image: Pick<ImagePayload, 'id' | 'url' | 'thumbnail_url'> | null
  inserted_at: string
  managed_status: 'partner' | 'regular' | 'client'
  members: MembershipPayload[]
  name: string
  neural_models_enabled: boolean
  partner: TeamPayload | null
  partner_id: number | null
  slug: string
  two_factor_auth_enforced: boolean
  sso_enforced: boolean
  enforcing_sso_allowed: boolean
  default_role?: string
  email_domain?: string
  /* eslint-enable camelcase */
}
