import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { moveItemsToPath as request } from '@/utils/backend'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

export type Payload = {
  dataset: DatasetPayload
  filter: DatasetItemFilter,
  path: string
}

/**
 * Tag a collection of dataset items
 * @param dataset Dataset
 * @param annotationClassId Annotation class id to tag
 * @param action 'tag' | 'untag'
 */
export const moveItemsToPath: DatasetAction<Payload> = async (
  { commit, dispatch, getters },
  { dataset, filter, path }
) => {
  // This prevents us from, for example, viewing root with folders disabled,
  // selecting everything and then moving it to root. Why?
  if (path === getters.currentPath) { return }

  const params: Parameters<typeof request>[0] = { path, datasetId: dataset.id, filter }
  const response = await request(params)

  if ('error' in response) { return response }

  commit('MOVE_SELECTED_ITEMS_TO_PATH', path)

  dispatch('loadDatasetFoldersThrottled', { datasetId: dataset.id })
  const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
  dispatch('loadDatasetItemCountsThrottled', countsPayload)

  return response
}
