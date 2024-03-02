import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'

export const getScoreInCurrentTeam: Getter<TeamState, RootState> = (state) =>
  (memberId: number) => {
    const { currentTeam } = state
    if (!currentTeam) { return null }
    const teamScores = state.scoresByTeam[currentTeam.id]
    if (!teamScores) { return null }
    return teamScores[memberId] || null
  }
