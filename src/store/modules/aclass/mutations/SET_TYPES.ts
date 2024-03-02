import { AClassMutation } from '@/store/modules/aclass/types'
import { AnnotationTypePayload } from '@/store/types'

export const SET_TYPES: AClassMutation<AnnotationTypePayload[]> = (
  state,
  annotationTypes
) => {
  state.types = annotationTypes
}
