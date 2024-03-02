import { ref, Ref, watch, onBeforeUnmount } from 'vue'

import { MeasureOverlayData } from '@/engineV2/models'
import { View } from '@/engineV2/views'

export const useMeasureOverlayData = (view: Ref<View>): Ref<MeasureOverlayData[]> => {
  const measureData = ref(view.value.measureManager.measureData)

  const handleMeasureChanged = (measureDataArr: MeasureOverlayData[]): void => {
    measureData.value = measureDataArr
  }

  watch(() => view.value, (newView, oldView) => {
    oldView?.measureManager.off('measureData:changed', handleMeasureChanged)

    handleMeasureChanged(view.value.measureManager.measureData)

    newView?.measureManager.on('measureData:changed', handleMeasureChanged)
  }, { immediate: true })

  onBeforeUnmount(() => {
    view.value.measureManager.off('measureData:changed', handleMeasureChanged)
  })

  return measureData as Ref<MeasureOverlayData[]>
}
