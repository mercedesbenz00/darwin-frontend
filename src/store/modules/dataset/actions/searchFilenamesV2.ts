import { uniqBy } from 'lodash'

import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemType, LoadingStatus } from '@/store/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'
import { PaginationParams } from '@/store/types/PaginationTypes'
import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { loadV2DatasetItems, LoadDatasetItemsParams } from '@/utils/backend/loadV2DatasetItems'

export type SearchFilenamesParams = {
  datasetId: number
  teamSlug: string
  search: string
}

export const LOADING_KEY = 'dataset/searchFilenamesV2'

export const searchFilenamesV2: DatasetAction<SearchFilenamesParams> = async (
  { commit, getters, state },
  { datasetId, search, teamSlug }
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

  const filter = getters.datasetItemApiFilterV2 as V2DatasetItemFilter
  const page: PaginationParams = { size: 100 }
  const query: LoadDatasetItemsParams = {
    teamSlug,
    annotation_class_ids: filter.annotation_class_ids,
    dataset_ids: [datasetId],
    item_name_contains: search,
    item_paths: filter.item_paths,
    page,
    statuses: filter.statuses,
    types: filter.types,
    workflow_stage_ids: filter.workflow_stage_ids
  }
  const response = await loadV2DatasetItems(query)

  commit(
    'loading/SET_ACTION_LOADING_STATUS',
    { key: LOADING_KEY, status: LoadingStatus.Loaded },
    { root: true }
  )

  // if response errored, return now and stop polling
  if ('error' in response) { return response }

  // if response is not a pagination response, throw an error
  if (!('items' in response.data) || !('page' in response.data)) {
    throw new Error('[dataset/loadAllDatasetItems]: Expected pagination response')
  }

  // if dataset changed, stop polling
  if (datasetId !== state.currentDataset.id) { return { data: [] } }

  const filenames: DatasetItemFilenamePayload[] = response.data.items.map(item => ({
    filename: item.name,
    type: item.slot_types.length ? item.slot_types[0] : DatasetItemType.image,
    isDicom: item.slot_types.includes(DatasetItemType.dicom),
    isPdf: item.slot_types.includes(DatasetItemType.pdf)
  }))
  const uniqFilenames = uniqBy(filenames, 'filename')

  commit('SET_DATASET_ITEM_FILENAMES', uniqFilenames)
  return { data: uniqFilenames }
}
