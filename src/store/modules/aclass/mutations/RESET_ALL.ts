import { getInitialState } from '@/store/modules/aclass/state'
import { AClassMutation } from '@/store/modules/aclass/types'
import { copyAttributes } from '@/utils'

export const RESET_ALL: AClassMutation<void> = (state) => {
  // types are global, so they don't need to be reset
  // we keep them here and then put back into the store after reset
  const { types, typesLoadingStatus } = state

  copyAttributes(state, getInitialState())

  state.types = types
  state.typesLoadingStatus = typesLoadingStatus
}
