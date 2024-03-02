import { AClassMutation } from '@/store/modules/aclass/types'
import { AnnotationClassPayload } from '@/store/types/AnnotationClassPayload'

export const PUSH_CLASSES: AClassMutation<AnnotationClassPayload[]> =
  (state, data) => {
    const newIds = data.map(ac => ac.id)
    state.classes = state.classes.filter(c => !newIds.includes(c.id)).concat(data)
  }
