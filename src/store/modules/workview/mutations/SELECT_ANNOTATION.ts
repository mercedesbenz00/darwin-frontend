import { WorkflowMutation } from '@/store/modules/workview/types'
import { matchAnnotation } from '@/store/modules/workview/utils'

import { DESELECT_ALL_ANNOTATIONS } from './DESELECT_ALL_ANNOTATIONS'

export const SELECT_ANNOTATION: WorkflowMutation<string> = (state, id) => {
  const annotation = matchAnnotation(state, id)
  if (!annotation || annotation.isSelected) { return }
  DESELECT_ALL_ANNOTATIONS(state)
  annotation.isSelected = true
}
