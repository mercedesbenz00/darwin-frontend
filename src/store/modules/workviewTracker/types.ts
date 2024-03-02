import { WorkviewTrackerState } from '@/store/modules/workviewTracker'
import { TypedAction, RootState } from '@/store/types'

export type WorkviewTrackerAction<PayloadType, ReturnType = any> =
  TypedAction<WorkviewTrackerState, RootState, PayloadType, ReturnType>
