import Vue from 'vue'

import { WorkflowMutation } from '@/store/modules/workview/types'

export const SHOW_ANNOTATIONS_BY_AUTHOR: WorkflowMutation<number> = (state, userId: number) => {
  Vue.set(state.hiddenAuthorsMap, userId, false)
}
