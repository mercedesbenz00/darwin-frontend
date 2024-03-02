import { MembershipRole } from './MembershipRole'
import { TeamPayload } from './TeamPayload'
import { UserPayload } from './UserPayload'

export type InvitationPayload = {
  /* eslint-disable camelcase */
  id: number
  team_id: number
  confirmed: boolean
  email: string
  role: MembershipRole
  team: TeamPayload
  user: UserPayload
  /* eslint-enable camelcase */
}
