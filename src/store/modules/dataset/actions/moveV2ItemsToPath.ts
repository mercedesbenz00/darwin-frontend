import { loadV2DatasetFolders } from '@/store/modules/dataset/actions/loadV2DatasetFolders'
import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { moveV2ItemsToPath as request } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

export type Payload = {
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>,
  path: string
}

/**
 * Tag a collection of dataset items
 * @param dataset Dataset
 * @param path folder path to move
 * @param filter filter params
 */
export const moveV2ItemsToPath: DatasetAction<Payload> = async (
  { dispatch, getters },
  { dataset, filters, path }
) => {
  // This prevents us from, for example, viewing root with folders disabled,
  // selecting everything and then moving it to root. Why?
  if (path === getters.currentPath) { return }

  const params: Parameters<typeof request>[0] = {
    filters: { ...filters, dataset_ids: [dataset.id] },
    path,
    teamSlug: dataset.team_slug
  }
  const response = await request(params)

  if ('error' in response) { return response }

  const payload: StoreActionPayload<typeof loadV2DatasetFolders> = {
    datasetId: dataset.id,
    teamSlug: dataset.team_slug
  }
  dispatch('loadV2DatasetFoldersThrottled', payload)

  const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = { dataset }
  dispatch('loadV2DatasetItemCountsThrottled', countsPayload)

  return response
}
