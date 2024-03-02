import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import {
  MembershipPayload,
  RootState,
  WorkflowStagePayload
} from '@/store/types'

/**
 * Returns assignee (as team membership) for the specified stage instance
 */
export const stageInstanceAssignee: Getter<WorkviewState, RootState> =
 (state, getters, rootState, rootGetters) =>
   (stage: WorkflowStagePayload): MembershipPayload | null => {
     if (!stage.assignee_id) { return null }
     const memberships: MembershipPayload[] = rootGetters['team/relevantTeamMemberships']
     return memberships.find(m =>
       m.user_id === stage.assignee_id) || null
   }
