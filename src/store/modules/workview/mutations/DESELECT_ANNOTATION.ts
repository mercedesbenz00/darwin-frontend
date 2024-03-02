import { WorkflowMutation } from '@/store/modules/workview/types'
import { matchAnnotation } from '@/store/modules/workview/utils'

export const DESELECT_ANNOTATION: WorkflowMutation<string> = (state, id) => {
  const annotation = matchAnnotation(state, id)
  if (!annotation || !annotation.isSelected) { return }
  annotation.isSelected = false
}
