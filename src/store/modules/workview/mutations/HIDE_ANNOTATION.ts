import { WorkflowMutation } from '@/store/modules/workview/types'
import { matchAnnotation } from '@/store/modules/workview/utils'

export const HIDE_ANNOTATION: WorkflowMutation<string> = (state, id) => {
  const annotation = matchAnnotation(state, id)
  if (!annotation || !annotation.isVisible) { return }
  annotation.isVisible = false
}
