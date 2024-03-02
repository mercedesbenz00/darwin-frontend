import { AClassMutation } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types/AnnotationClassPayload'

export const SET_CLASSES: AClassMutation<AnnotationClassPayload[]> = (state, classes) => {
  state.classes = classes
  state.classesById = Object.fromEntries(classes.map(c => [c.id, c]))
}
