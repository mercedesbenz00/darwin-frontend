import MockAdapter from 'axios-mock-adapter'
import { Store } from 'vuex'

import { buildMembershipPayload, buildTeamPayload, buildUserPayload } from 'test/unit/factories'

import { Ability, MembershipPayload, RootState, TeamPayload, UserPayload } from '@/store/types'

type Payload = {
  user: UserPayload,
  memberships: MembershipPayload[],
  // eslint-disable-next-line camelcase
  selected_team: TeamPayload
  teams: TeamPayload[],
  // eslint-disable-next-line camelcase
  selected_team_abilities: Ability
}

const v7 = buildTeamPayload({ id: 7, name: 'v7' })
const sam = buildUserPayload({ id: 1, first_name: 'Sam' })
const samV7Membership = buildMembershipPayload({ id: 1, user_id: sam.id, team_id: v7.id })
const viewTeam: Ability = {
  actions: ['view_team'],
  conditions: {},
  subject: 'all'
}

export const login = async (
  store: Store<RootState>,
  axiosMock: MockAdapter,
  payload: Payload = {
    user: sam,
    memberships: [samV7Membership],
    selected_team_abilities: viewTeam,
    selected_team: v7,
    teams: [v7]
  },
  credentials = {}
): Promise<Payload> => {
  axiosMock.onPost(/users\/authenticate/)
    .replyOnce(200, {
      ...payload.user,
      memberships: payload.memberships,
      refresh_token: 'fake_refresh_token',
      selected_team_abilities: payload.selected_team_abilities,
      selected_team: payload.selected_team,
      teams: payload.teams,
      token_expiration: 'fake_expiration',
      token: 'fake_token'
    })

  await store.dispatch('auth/login', credentials)

  return payload
}
