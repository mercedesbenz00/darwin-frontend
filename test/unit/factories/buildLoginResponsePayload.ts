import { Ability, LoginResponsePayload } from '@/store/types'

import { buildMembershipPayload } from './buildMembershipPayload'
import { buildTeamPayload } from './buildTeamPayload'
import { buildUserPayload } from './buildUserPayload'

type Params = Partial<LoginResponsePayload>

const sam = buildUserPayload({ id: 1, first_name: 'Sam' })
const v7 = buildTeamPayload({ id: 7, name: 'v7' })
const samV7Membership = buildMembershipPayload({ id: 1, user_id: 1, team_id: 1 })
const viewTeam: Ability = {
  actions: ['view_team'],
  conditions: {},
  subject: 'all'
}

export const buildLoginResponsePayload = (params: Params = {}): LoginResponsePayload => ({
  ...sam,
  memberships: [samV7Membership],
  refresh_token: 'fake_refresh_token',
  selected_team_abilities: [viewTeam],
  selected_team: v7,
  teams: [v7],
  token_expiration: 'fake_expiration',
  token: 'fake_token',
  ...params
})
