import { ComputedRef, computed } from 'vue'

import { useStore } from '@/composables'
import { V2DatasetItemPayload } from '@/store/types'

export const useDatasetItemsV2 = (): ComputedRef<V2DatasetItemPayload[]> => {
  const { getters } = useStore()

  return computed(() => getters['workview/v2DatasetItems'])
}
