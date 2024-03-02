import { AClassMutation } from '@/store/modules/aclass/types'

export const REMOVE_CLASSES: AClassMutation<number[]> = (state, classIds) => {
  state.classes = state.classes.filter(c => !classIds.includes(c.id))
}
