import { WorkflowMutation } from '@/store/modules/workview/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'

type Payload = AnnotationTypeName[]

export const SET_TOOL_ANNOTATION_TYPES: WorkflowMutation<Payload> = (state, payload) => {
  state.toolAnnotationTypes = payload
}
