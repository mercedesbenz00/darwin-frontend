import { WorkflowMutation } from '@/store/modules/workview/types'

type Payload = { annotationIds: string[], visibility: boolean }

export const UPDATE_ANNOTATIONS_VISIBILITY: WorkflowMutation<Payload> = (state, params) => {
  const { annotationIds, visibility } = params

  state.stageAnnotations.forEach((annotation) => {
    if (annotationIds.includes(annotation.id)) {
      annotation.isVisible = visibility
    }
  })
}
