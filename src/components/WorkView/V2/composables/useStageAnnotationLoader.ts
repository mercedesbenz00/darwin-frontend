import { onBeforeUnmount, watch } from 'vue'

import { useCurrentItem } from '@/composables/useEditorV2'
import { useStore } from '@/composables/useStore'

/**
 * Watches for changes of `workview.selectedDatasetItem`
 * and loads the (V2) stage annotations for it.
 *
 * Renderless component
 */
export const useStageAnnotationLoader = (): void => {
  const { dispatch, commit } = useStore()

  const currentItem = useCurrentItem()

  watch(() => currentItem.value, (item) => {
    commit('workview/CLEAR_STAGE_ANNOTATIONS')
    if (!item?.id) { return }
    dispatch('workview/loadV2Annotations', item.id)
  }, { immediate: true })

  onBeforeUnmount(() => {
    commit('workview/CLEAR_STAGE_ANNOTATIONS')
  })
}
