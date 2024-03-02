import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { AnnotationOverlayData } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export const useOverlays = (view: Ref<View>): Ref<AnnotationOverlayData[]> => {
  const overlays = ref<AnnotationOverlayData[]>(
    Object.values(view.value.overlayManager.annotationOverlayDataEntries)
  )

  const handleOverlaysChange = (overlaysArr: AnnotationOverlayData[]): void => {
    overlays.value = overlaysArr
  }

  watch(() => view.value, (newView, oldView) => {
    oldView?.overlayManager?.off('overlays:changed', handleOverlaysChange)

    handleOverlaysChange(Object.values(newView.overlayManager.annotationOverlayDataEntries))

    newView?.overlayManager.on('overlays:changed', handleOverlaysChange)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value.overlayManager.off('overlays:changed', handleOverlaysChange)
  })

  return overlays as Ref<AnnotationOverlayData[]>
}
