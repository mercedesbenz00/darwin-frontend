import { TeamPayload } from '@/store/types'

type TeamPayloadBuildParams = Partial<TeamPayload>

const defaultImage = {
  id: -1,
  thumbnail_url: '',
  url: ''
}

export const buildTeamPayload = (
  params: TeamPayloadBuildParams
): TeamPayload => ({
  clients: [],
  disable_dataset_sharing: false,
  disabled: false,
  enforcing_two_factor_auth_allowed: false,
  id: -1,
  image: { ...defaultImage, ...(params.image || {}) },
  inserted_at: '2000-01-01',
  managed_status: 'regular',
  members: [],
  name: 'Some Team',
  neural_models_enabled: false,
  partner_id: null,
  partner: null,
  slug: 'some-team',
  two_factor_auth_enforced: false,
  sso_enforced: false,
  enforcing_sso_allowed: false,
  ...params
})
