import { useStore } from '@/composables/useStore'
import {
  SET_EDITED_WORKFLOW_NAME
} from '@/store/modules/V2Workflow/mutations/SET_EDITED_WORKFLOW_NAME'
import {
  UPDATE_ASSIGNABLE_USERS
} from '@/store/modules/V2Workflow/mutations/UPDATE_ASSIGNABLE_USERS'
import { UPDATE_STAGE_CONFIG } from '@/store/modules/V2Workflow/mutations/UPDATE_STAGE_CONFIG'
import { StoreMutationPayload } from '@/store/types'

/**
 * A wrapper around the vuex v2 workflow store edited workflow
 * and associated mutations, so we can later more easily either convert it to
 * a proper pinia store, or merge with the workflow scene store.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useEditedWorkflow = () => {
  const store = useStore()

  const updateStageConfig =
      (payload: StoreMutationPayload<typeof UPDATE_STAGE_CONFIG>): void =>
        store.commit('v2Workflow/UPDATE_STAGE_CONFIG', payload)

  const updateAssignableUsers =
      (payload: StoreMutationPayload<typeof UPDATE_ASSIGNABLE_USERS>): void =>
        store.commit('v2Workflow/UPDATE_ASSIGNABLE_USERS', payload)

  const updateWorkflowName = (newName: string): void => {
    const payload: StoreMutationPayload<typeof SET_EDITED_WORKFLOW_NAME> = newName
    store.commit('v2Workflow/SET_EDITED_WORKFLOW_NAME', payload)
  }

  return { updateAssignableUsers, updateStageConfig, updateWorkflowName }
}
