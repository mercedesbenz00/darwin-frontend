import { Getter } from 'vuex'

import { RootState, V2Workflows } from '@/store/types'

/**
 * Will return V2WorkflowPayload when passing id
 * */
export const getWorkflowById: Getter<V2Workflows, RootState> = (state) => (id: string) => {
  return state.workflows.find((workflow) => workflow.id === id) ?? null
}
