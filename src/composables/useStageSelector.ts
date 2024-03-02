import { computed, onMounted, watch } from 'vue'

import { useStore } from '@/composables/useStore'
import {
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload
} from '@/store/types'

/**
 * In charge of selecting the correct v2 stage and stage instance, based on
 * currently loaded state.
 */
export const useStageSelector = (): void => {
  const { state, commit } = useStore()

  const item = computed(() => state.workview.v2WorkflowItemState)
  const user = computed(() => state.user.profile)
  // this is supposed to be the default workflow
  const workflow = computed(() => state.workview.v2Workflows[0] || null)

  /**
   * The result of this getter will get selected as a stage instance
   *
   * The rules are
   *
   * - no active item -> no stage instance
   * - item with multiple current instances -> prefer the one assigned to user, otherwise take first
   * - item with single current instance -> that instance
   */
  const instance = computed((): V2WorkflowStageInstancePayload | null => {
    if (!item.value) { return null }
    return (
      item.value.current_stage_instances.find(i => i.user_id === user.value?.id) ||
      item.value.current_stage_instances[0] ||
      null
    )
  })

  /**
   * The result of this getter will get selected as a stage
   *
   * The rules are
   *
   * - active stage instance -> the stage of that stage instance
   * - no active item -> the first initial stage in the workflow
   */
  const stage = computed((): V2WorkflowStagePayload | null => {
    if (instance.value) {
      return instance.value.stage
    }

    return workflow.value?.stages.find(s =>
      'initial' in s.config && s.config.initial === true
    ) || null
  })

  const select = (): void => {
    commit('workview/SET_V2_SELECTED_STAGE', stage.value)
    commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance.value)
  }

  onMounted(() => {
    select()
  })

  watch(() => item.value, () => {
    select()
  })

  watch(() => workflow.value, () => {
    select()
  })
}
