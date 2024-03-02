import { WorkflowMutation } from '@/store/modules/workview/types'

export const DESELECT_ALL_ANNOTATIONS: WorkflowMutation<void> = (state) => {
  const { stageAnnotations } = state
  for (let i = 0; i < stageAnnotations.length; i++) {
    const annotation = stageAnnotations[i]
    if (!annotation.isSelected) { continue }
    annotation.isSelected = false
  }
}
