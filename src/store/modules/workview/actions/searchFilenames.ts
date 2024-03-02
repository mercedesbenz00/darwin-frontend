import { uniqBy } from 'lodash'

import { WorkviewAction } from '@/store/modules/workview/types'
import { LoadingStatus } from '@/store/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'
import { PaginationParams } from '@/store/types/PaginationTypes'
import { isDicomItem, isPdfItem } from '@/utils'
import { loadDatasetItems, LoadDatasetItemsParams } from '@/utils/backend/loadDatasetItems'

export type SearchFilenamesParams = {
  search: string
}

export const LOADING_KEY = 'workview/searchFilenames'

export const searchFilenames: WorkviewAction<SearchFilenamesParams> = async (
  { commit, state },
  { search }
) => {
  const { dataset } = state
  if (!dataset) { return { data: [] } }
  const { datasetItemFilter } = state

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

  const page: PaginationParams = { size: 100 }
  const query: LoadDatasetItemsParams = {
    annotation_class_ids: datasetItemFilter.annotation_class_ids,
    datasetId: dataset.id,
    filename_contains: search,
    path: datasetItemFilter.path,
    page,
    statuses: datasetItemFilter.statuses,
    types: datasetItemFilter.types,
    video_ids: datasetItemFilter.video_ids,
    workflow_stage_template_ids: datasetItemFilter.workflow_stage_template_ids
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
