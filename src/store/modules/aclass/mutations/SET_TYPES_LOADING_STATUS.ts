import { AClassMutation } from '@/store/modules/aclass/types'
import { LoadingStatus } from '@/store/types'

export const SET_TYPES_LOADING_STATUS: AClassMutation<LoadingStatus> = (
  state,
  status
) => {
  state.typesLoadingStatus = status
}
