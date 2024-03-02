import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { restoreV2Items } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
}

/**
 * Restores all specified items belonging to the specified dataset
 */
export const restoreV2DatasetItems: DatasetAction<Payload> = async ({ dispatch }, payload) => {
  const { dataset, filters } = payload
  const response = await restoreV2Items({
    filters: { ...filters, dataset_ids: [dataset.id] },
    teamSlug: dataset.team_slug
  })

  if ('error' in response) { return response }

  const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = { dataset }
  dispatch('loadV2DatasetItemCountsThrottled', countsPayload)

  return response
}
