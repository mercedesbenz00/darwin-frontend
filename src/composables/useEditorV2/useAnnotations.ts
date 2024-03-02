import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Provides reactive annotations array.
 *
 * Subscribes to Editor annotation manager CRUD events
 * to keep annotations updated.
 *
 * @param activeView
 * @returns
 */
export const useAnnotations = (activeView: Ref<View>): Ref<Annotation[]> => {
  const annotations = ref<Annotation[]>(activeView.value.annotationManager.annotations)

  const handleAnnotationsChange = (): void => {
    annotations.value = activeView.value.annotationManager.annotations
  }

  watch(() => activeView.value, (newView, oldView) => {
    oldView?.annotationManager?.off('annotations:changed', handleAnnotationsChange)
    oldView?.annotationManager?.off('annotation:create', handleAnnotationsChange)
    oldView?.annotationManager?.off('annotation:update', handleAnnotationsChange)
    oldView?.annotationManager?.off('annotation:delete', handleAnnotationsChange)

    handleAnnotationsChange()

    newView?.annotationManager.on('annotations:changed', handleAnnotationsChange)
    newView?.annotationManager.on('annotation:create', handleAnnotationsChange)
    newView?.annotationManager.on('annotation:update', handleAnnotationsChange)
    newView?.annotationManager.on('annotation:delete', handleAnnotationsChange)
  }, { immediate: true })

  onBeforeUnmount(() => {
    activeView.value.annotationManager.off('annotations:changed', handleAnnotationsChange)
    activeView.value.annotationManager.off('annotation:create', handleAnnotationsChange)
    activeView.value.annotationManager.off('annotation:update', handleAnnotationsChange)
    activeView.value.annotationManager.off('annotation:delete', handleAnnotationsChange)
  })

  return annotations as Ref<Annotation[]>
}
