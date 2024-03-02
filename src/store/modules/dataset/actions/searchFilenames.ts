import { uniqBy } from 'lodash'

import { DatasetAction } from '@/store/modules/dataset/types'
import { LoadingStatus } from '@/store/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { PaginationParams } from '@/store/types/PaginationTypes'
import { isDicomItem, isPdfItem } from '@/utils'
import { loadDatasetItems, LoadDatasetItemsParams } from '@/utils/backend/loadDatasetItems'

export type SearchFilenamesParams = {
  datasetId: number
  search: string
}

export const LOADING_KEY = 'dataset/searchFilenames'

export const searchFilenames: DatasetAction<SearchFilenamesParams> = async (
  { commit, getters, state },
  { datasetId, search }
) => {
  if (datasetId !== state.currentDataset.id) { return { data: [] } }

  const trimmedSearch = search.trim()
  if (!trimmedSearch) {
    commit('SET_DATASET_ITEM_FILENAMES', [])
    return { data: [] }
  }

  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loading },
    { root: true }
  )

  const filter = getters.datasetItemApiFilter as DatasetItemFilter
  const page: PaginationParams = { size: 100 }
  const query: LoadDatasetItemsParams = {
    annotation_class_ids: filter.annotation_class_ids,
    datasetId,
    filename_contains: search,
    path: filter.path,
    page,
    statuses: filter.statuses,
    types: filter.types,
    video_ids: filter.video_ids,
    workflow_stage_template_ids: filter.workflow_stage_template_ids
  }
  const response = await loadDatasetItems(query)

  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loaded },
    { root: true }
  )

  // if response errored, return now and stop polling
  if ('error' in response) { return response }

  // if response is not a pagination response, throw an error
  if (!('items' in response.data) || !('metadata' in response.data)) {
    throw new Error('[dataset/loadAllDatasetItems]: Expected pagination response')
  }

  // if dataset changed, stop polling
  if (datasetId !== state.currentDataset.id) { return { data: [] } }

  const filenames: DatasetItemFilenamePayload[] = response.data.items.map(item => ({
    filename: item.filename,
    type: item.type,
    isDicom: isDicomItem(item),
    isPdf: isPdfItem(item)
  }))
  const uniqFilenames = uniqBy(filenames, 'filename')

  commit('SET_DATASET_ITEM_FILENAMES', uniqFilenames)
  return { data: uniqFilenames }
}
