import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { AClassMutation } from '@/store/modules/aclass/types'

export const SET_CLASSES_TAB_VIEW_MODE: AClassMutation<VIEW_MODE> = (state, viewMode) => {
  state.classesTabViewMode = viewMode
}
