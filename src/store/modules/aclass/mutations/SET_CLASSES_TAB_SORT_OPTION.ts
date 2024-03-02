import { AClassMutation } from '@/store/modules/aclass/types'

export const SET_CLASSES_TAB_SORT_OPTION: AClassMutation<{
  by: 'id',
  direction: 'asc' | 'desc'
}> = (state, params) => {
  state.classesTabSortBy = params.by
  state.classesTabSortDirection = params.direction
}
