import { TeamPayload, InvitationPayload, MembershipPayload, MembershipScore } from '@/store/types'
import { ClientTeamInvitationPayload } from '@/store/types/ClientTeamInvitationPayload'

export type TeamState = {
  /**
   * Holds all client team invitations application is aware off.
   *
   * There is no guarantee they are for current team only, so working with
   * invitations for the current team should be done via related getter.
   */
  clientTeamInvitations: ClientTeamInvitationPayload[]
  currentTeam: TeamPayload | null
  invitations: InvitationPayload[]
  memberships: MembershipPayload[]
  scoresByDataset: { [s: number]: { [s: number]: MembershipScore } }
  scoresByTeam: { [s: number]: { [s: number]: MembershipScore } }
  teams: TeamPayload[]
}

export const getInitialState = (): TeamState => ({
  clientTeamInvitations: [],
  currentTeam: null,
  invitations: [],
  memberships: [],
  scoresByDataset: {},
  scoresByTeam: {},
  teams: []
})

const state: TeamState = getInitialState()

export default state
