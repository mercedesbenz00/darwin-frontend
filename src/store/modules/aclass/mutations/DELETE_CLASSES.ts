import Vue from 'vue'

import { AClassMutation } from '@/store/modules/aclass/types'

export const DELETE_CLASSES: AClassMutation<number[]> = (state, annotationClassIds) => {
  const classSelected: any = {}
  for (const classId of annotationClassIds) {
    classSelected[classId] = true
  }
  Vue.set(state, 'classes', state.classes.filter(aclass => !classSelected[aclass.id]))
}
