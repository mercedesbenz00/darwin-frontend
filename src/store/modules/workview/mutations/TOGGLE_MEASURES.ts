import { WorkflowMutation } from '@/store/modules/workview/types'

export const TOGGLE_MEASURES: WorkflowMutation<void> = (state) => {
  state.renderMeasures = !state.renderMeasures
}
