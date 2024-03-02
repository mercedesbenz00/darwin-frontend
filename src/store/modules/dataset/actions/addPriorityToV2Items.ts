import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { addPriorityToV2Items as request } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
  priority: number
}

/**
 * Add priority to a collection of dataset items
 * @param dataset Dataset
 * @param filters Filter
 * @param priority New priority
 */
export const addPriorityToV2Items: DatasetAction<Payload> = async (
  { dispatch },
  { dataset, filters, priority }
) => {
  const response = await request({
    filters: { ...filters, dataset_ids: [dataset.id] },
    priority,
    teamSlug: dataset.team_slug
  })

  if ('error' in response) { return response }

  const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = { dataset }
  dispatch('loadV2DatasetItemCountsThrottled', countsPayload)

  return response
}
