import { Ability } from '@/store/types'

import { MembershipPayload } from './MembershipPayload'
import { TeamPayload } from './TeamPayload'
import { UserPayload } from './UserPayload'

export type LoginResponsePayload = UserPayload & {
  /* eslint-disable camelcase */
  memberships: MembershipPayload[]
  refresh_token: string
  selected_team_abilities: Ability[]
  selected_team: TeamPayload | null
  teams: TeamPayload[]
  token_expiration: string
  token: string
  /* eslint-enable camelcase */
}
