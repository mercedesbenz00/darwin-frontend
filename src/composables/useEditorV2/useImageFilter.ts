import { onBeforeUnmount, watch, ref, Ref } from 'vue'

import { useActiveView } from '@/composables/useEditorV2/useActiveView'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

export const useImageManipulationFilter = (): {
  imageFilter: Ref<ImageManipulationFilter>,
  updateFilter: (newFilter: Partial<ImageManipulationFilter>) => void
} => {
  const activeView = useActiveView()
  const filter = ref<ImageManipulationFilter | null>(null)

  const handleFilterChange = (newFilter: ImageManipulationFilter | null): void => {
    filter.value = newFilter
  }

  watch(() => activeView.value, (newActiveView, oldActiveView) => {
    newActiveView.on('imageFilter:changed', handleFilterChange)
    handleFilterChange(newActiveView.imageFilter)

    oldActiveView?.off('imageFilter:changed', handleFilterChange)
  }, { immediate: true })

  onBeforeUnmount(() => {
    activeView.value.off('imageFilter:changed', handleFilterChange)
  })

  const updateFilter = (newFilter: Partial<ImageManipulationFilter>): void => {
    activeView.value.setImageFilter({
      ...filter.value,
      ...newFilter as ImageManipulationFilter
    })
  }

  return { imageFilter: filter as Ref<ImageManipulationFilter>, updateFilter }
}
