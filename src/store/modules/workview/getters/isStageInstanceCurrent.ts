import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { getTimeState } from '@/store/modules/workview/utils'
import {
  StageTimeState,
  RootState,
  WorkflowStagePayload
} from '@/store/types'

/**
 * Checks if specified stage instance is the current instance for the workflow.
 */
export const isStageInstanceCurrent: Getter<WorkviewState, RootState> = (state) =>
  (instance: WorkflowStagePayload): boolean =>
    getTimeState(state, instance) === StageTimeState.Current
