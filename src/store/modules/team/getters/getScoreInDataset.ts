import { Getter } from 'vuex'

import { TeamState } from '@/store/modules/team/state'
import { RootState } from '@/store/types'

export const getScoreInDataset: Getter<TeamState, RootState> = (state) =>
  (memberId: number, datasetId: number) => {
    const datasetScores = state.scoresByDataset[datasetId]
    if (!datasetScores) { return null }
    return state.scoresByDataset[datasetId][memberId] || null
  }
