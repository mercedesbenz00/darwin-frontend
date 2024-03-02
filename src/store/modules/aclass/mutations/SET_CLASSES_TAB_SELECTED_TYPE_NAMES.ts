import { AClassMutation } from '@/store/modules/aclass/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'

export const SET_CLASSES_TAB_SELECTED_TYPE_NAMES: AClassMutation<AnnotationTypeName[]> = (
  state,
  names
) => {
  state.classesTabSelectedTypeNames = [...names]
}
