import { AClassMutation } from '@/store/modules/aclass/types'

export const SET_CLASS_DETAILS: AClassMutation<any> = (state, data) => {
  state.details = data
}
