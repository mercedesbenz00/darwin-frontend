import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { RootState } from '@/store/types'

import { stageInstanceAssignee } from './stageInstanceAssignee'

/**
 * Returns assignee (as team membership) for the currently selected stage instance
 */
export const selectedStageInstanceAssignee: Getter<WorkviewState, RootState> =
 (state, getters, rootState, rootGetters) => {
   const { selectedStageInstance } = state
   if (!selectedStageInstance) { return null }
   return stageInstanceAssignee(state, getters, rootState, rootGetters)(selectedStageInstance)
 }
