import { ComputedRef, computed } from 'vue'

import { useStore } from '@/composables'
import { V2DatasetItemPayload } from '@/store/types'

export const useSelectedDatasetItemV2 = (): ComputedRef<V2DatasetItemPayload> => {
  const { getters } = useStore()

  return computed(() => getters['workview/v2SelectedDatasetItem'])
}
