import Vue from 'vue'

import { WorkflowMutation } from '@/store/modules/workview/types'

export const SHOW_ANNOTATIONS_BY_CLASS: WorkflowMutation<number> = (state, classId: number) => {
  Vue.set(state.hiddenClassesMap, classId, false)
}
