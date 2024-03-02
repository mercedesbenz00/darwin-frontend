import { TeamPayload } from '@/store/types'

export const v7: TeamPayload = {
  clients: [],
  disable_dataset_sharing: false,
  disabled: false,
  enforcing_sso_allowed: false,
  enforcing_two_factor_auth_allowed: false,
  id: 7,
  image: null,
  inserted_at: '2020-01-01T00:00:00',
  managed_status: 'regular',
  members: [],
  name: 'V7',
  neural_models_enabled: true,
  partner_id: null,
  partner: null,
  slug: 'v7',
  sso_enforced: false,
  two_factor_auth_enforced: false
}

export const birdsClient: TeamPayload = {
  ...v7,
  id: 9,
  managed_status: 'client',
  name: 'Birds Team'
}

export const carsClient: TeamPayload = {
  ...v7,
  id: 10,
  managed_status: 'client',
  name: 'Cars Team'
}

export const partnerTeam: TeamPayload = {
  ...v7,
  id: 8,
  name: 'V7 Partner',
  managed_status: 'partner',
  clients: [birdsClient, carsClient]
}

export const polygonTeam: TeamPayload = {
  ...v7,
  id: 11,
  name: 'Polygon',
  slug: 'polygon',
  managed_status: 'client',
  image: {
    id: 1,
    url: 'https://res.cloudinary.com/polygonxyz/image/upload/w_32,q_auto/polygon/logo-2.png',
    thumbnail_url:
      'https://res.cloudinary.com/polygonxyz/image/upload/w_32,q_auto/polygon/logo-2.png'
  },
  partner_id: partnerTeam.id,
  partner: partnerTeam
}
