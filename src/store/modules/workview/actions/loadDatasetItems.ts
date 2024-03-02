import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { DatasetItemCursorMapping, WorkviewAction } from '@/store/modules/workview/types'
import { sanitizeStatusFilter } from '@/store/modules/workview/utils'
import {
  DatasetItemPayload,
  DatasetItemType,
  PagedApiResponse,
  PaginationParams
} from '@/store/types'
import { DatasetItemsLoadingState } from '@/store/types/DatasetItemsLoadingState'
import { loadDatasetItems as backendLoadDatasetItems } from '@/utils/backend'
import { loadDatasetItems as tutorialLoadDatasetItems } from '@/utils/tutorialBackend'

export type LoadDatasetItemsActionPayload = {
  datasetId: number,
  page: PaginationParams,
  openWorkMode: boolean
}

type LoadDatasetItemsAction = WorkviewAction<
  LoadDatasetItemsActionPayload,
  PagedApiResponse<DatasetItemPayload>
>

const loadDatasetItems: LoadDatasetItemsAction = async (
  { commit, state, rootGetters },
  payload
) => {
  const { datasetId, page, openWorkMode } = payload
  const { datasetItemFilter } = state
  const types = [DatasetItemType.image, DatasetItemType.videoFrame, DatasetItemType.playbackVideo]

  const isAuthorized = rootGetters['auth/isAuthorized'] as IsAuthorized

  const isMoreThanAnnotator = isAuthorized('view_full_datasets') || openWorkMode

  const params: Parameters<typeof backendLoadDatasetItems>[0] = {
    datasetId,
    page,
    types,
    ...datasetItemFilter
  }
  if (datasetItemFilter.not_statuses) {
    params.not_statuses = sanitizeStatusFilter(isMoreThanAnnotator, datasetItemFilter.not_statuses)
  } else {
    params.statuses = sanitizeStatusFilter(isMoreThanAnnotator, datasetItemFilter.statuses)
  }

  commit('SET_DATASET_ITEMS_LOADING', DatasetItemsLoadingState.Loading)

  const response = state.tutorialMode
    ? tutorialLoadDatasetItems(params)
    : await backendLoadDatasetItems(params)
  commit('SET_DATASET_ITEMS_LOADING', DatasetItemsLoadingState.Loaded)

  if ('error' in response) {
    return response
  }

  if (!('items' in response.data)) {
    const action = 'workview/loadDatasetItems'
    const message = 'Expected a pagination response from items endpoint.'
    throw new Error(`${action}: ${message}`)
  }

  const { items, metadata: { previous, next } } = response.data
  const ids = items.map(item => item.id)
  const cursorMapping: DatasetItemCursorMapping = { next, previous, ids }

  // contains_seq request is only used to get `from` & `to` information.
  if ('contains_seq' in page) {
    commit('PUSH_DATASET_ITEMS', items)
    return { data: response.data }
  }

  const currentPageIndex = state.datasetItemCursorMappings.findIndex((cm) =>
    ('from' in page && cm.next === page.from) ||
    ('to' in page && cm.previous === page.to)
  )

  if (currentPageIndex < 0) {
    if ('to' in page) {
      commit('UNSHIFT_DATASET_ITEMS', items)
      commit('UNSHIFT_DATASET_ITEM_CURSOR_MAPPING', cursorMapping)
      return { data: response.data }
    }

    commit('PUSH_DATASET_ITEMS', items)
    commit('PUSH_DATASET_ITEM_CURSOR_MAPPING', cursorMapping)
    return { data: response.data }
  }

  const currentPage = state.datasetItemCursorMappings[currentPageIndex]

  if ('to' in page) {
    if (currentPage.ids.length > 0) {
      commit('PUSH_DATASET_ITEMS_BEFORE', { items, id: currentPage.ids[0] })
    } else {
      commit('UNSHIFT_DATASET_ITEMS', items)
    }
    commit('PUSH_DATASET_ITEM_CURSOR_MAPPING_BEFORE', { cursorMapping, index: currentPageIndex })
    return { data: response.data }
  }

  if (currentPage.ids.length > 0) {
    commit('PUSH_DATASET_ITEMS_AFTER', { items, id: currentPage.ids[currentPage.ids.length - 1] })
  } else {
    commit('PUSH_DATASET_ITEMS', items)
  }
  commit('PUSH_DATASET_ITEM_CURSOR_MAPPING_AFTER', { cursorMapping, index: currentPageIndex })
  return { data: response.data }
}

export default loadDatasetItems
