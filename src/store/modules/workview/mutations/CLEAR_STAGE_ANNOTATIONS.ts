import { WorkflowMutation } from '@/store/modules/workview/types'

export const CLEAR_STAGE_ANNOTATIONS: WorkflowMutation<void> = (state) => {
  state.stageAnnotations = []
}
