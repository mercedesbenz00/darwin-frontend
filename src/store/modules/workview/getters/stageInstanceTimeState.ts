import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { getTimeState } from '@/store/modules/workview/utils'
import {
  StageTimeState,
  RootState,
  WorkflowStagePayload
} from '@/store/types'

export const stageInstanceTimeState: Getter<WorkviewState, RootState> = (state) =>
  (instance: WorkflowStagePayload): StageTimeState => getTimeState(state, instance)
