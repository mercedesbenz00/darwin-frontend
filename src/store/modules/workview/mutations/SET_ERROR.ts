import { WorkflowMutation } from '@/store/modules/workview/types'
import { ParsedError } from '@/utils'

export const SET_ERROR: WorkflowMutation<ParsedError['error']> =
  (state, error) => { state.error = error }
