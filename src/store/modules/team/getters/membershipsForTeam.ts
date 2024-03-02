import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState, TeamPayload } from '@/store/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export const membershipsForTeam: Getter<TeamState, RootState> =
  (state) => (team: TeamPayload): MembershipPayload[] =>
    state.memberships.filter(m => m.team_id === team.id)
