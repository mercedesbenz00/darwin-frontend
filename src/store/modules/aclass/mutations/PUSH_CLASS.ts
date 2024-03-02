import { AClassMutation } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types'

export const PUSH_CLASS: AClassMutation<AnnotationClassPayload> = (state, newClass) => {
  const idx = state.classes.findIndex(cl => cl.id === newClass.id)
  if (idx < 0) {
    state.classes.push(newClass)
  } else {
    state.classes.splice(idx, 1, newClass)
  }

  state.classesById = { ...state.classesById, [newClass.id]: newClass }
}
