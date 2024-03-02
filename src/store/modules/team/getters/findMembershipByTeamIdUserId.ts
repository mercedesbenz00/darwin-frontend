import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'
import { MembershipPayload } from '@/store/types/MembershipPayload'

export const findMembershipByTeamIdUserId: Getter<TeamState, RootState> = (state) =>
  (teamId: number, userId: number): MembershipPayload | null =>
    state.memberships.find(m => m.team_id === teamId && m.user_id === userId) || null
