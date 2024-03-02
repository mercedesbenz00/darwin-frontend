import { AClassMutation } from '@/store/modules/aclass/types'
import { LoadingStatus } from '@/store/types'

export const SET_CLASSES_LOADING_STATUS: AClassMutation<LoadingStatus> = (state, status) => {
  state.classesLoadingStatus = status
}
