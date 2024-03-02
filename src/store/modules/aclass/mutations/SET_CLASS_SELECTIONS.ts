import { AClassMutation } from '@/store/modules/aclass/types'

export const SET_CLASS_SELECTIONS: AClassMutation<
  { id: number; selected: boolean }[]
> = (state, selections) => {
  const classSelected = {
    ...state.classSelected
  }
  for (const selection of selections) {
    classSelected[selection.id] = selection.selected
  }
  state.classSelected = classSelected
}
