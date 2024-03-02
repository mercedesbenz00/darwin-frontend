import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { View } from '@/engineV2/views'

export const useCurrentFrameIndex = (view: Ref<View | null>): Ref<number> => {
  const currentFrameIndex = ref()

  const handleCurrentFrameIndexChanged = (index: number): void => {
    currentFrameIndex.value = index
  }

  watch(() => view.value, (newView, oldView) => {
    oldView?.off('currentFrameIndex:changed', handleCurrentFrameIndexChanged)

    if (!newView) {
      handleCurrentFrameIndexChanged(0)
      return
    }

    handleCurrentFrameIndexChanged(newView.currentFrameIndex)

    newView?.on('currentFrameIndex:changed', handleCurrentFrameIndexChanged)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value?.off('currentFrameIndex:changed', handleCurrentFrameIndexChanged)
  })

  return currentFrameIndex
}
