import { computed, Ref } from 'vue'

import { SortOptions } from '@/components/DatasetFiltering/types'
import { useRoute } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { loadV2DatasetItemCounts } from '@/store/modules/dataset/actions/loadV2DatasetItemCounts'
import {
  DatasetItemType,
  V2DatasetItemFilter,
  DatasetPayload,
  V2DatasetItemPayload,
  StoreActionPayload,
  DatasetItemStatus
} from '@/store/types'
import { getV2DatasetDefaultSortOptions, getV2DatasetItemFilterFromRouteQuery } from '@/utils'

type WorkviewItemsLoader = {
  initLoader: () => Promise<void>
  datasetItems: Ref<{ [id: string]: V2DatasetItemPayload }>
  getDatasetItemFilter: () => V2DatasetItemFilter | undefined
  resolveItemsData: (id: string, size?: number) => Promise<void>,
  resetState: () => void
}

/**
 * Composable used to load dataset items within workview.
 * Since it's only used in workview, it does some assumptions based on that.
 *
 * For example, by default, it excludes items with a status that isn't actionable
 * within workview.
 */
export const useDatasetItemsLoader = (dataset: Ref<DatasetPayload | null>): WorkviewItemsLoader => {
  const route = useRoute()
  const { state, dispatch, commit } = useStore()

  const datasetItems = computed(() => state.dataset.datasetItemsV2)

  const folderEnabled = computed<boolean>(() => state.dataset.folderEnabled)

  const path = computed<string>(() => {
    const { path } = route.query

    if (!path) { return '/' }

    return `${path}`
  })

  const defaultSortOptions = computed<SortOptions | undefined>(() => {
    if (!dataset.value) { return }

    const sortOptions = getV2DatasetDefaultSortOptions(dataset.value)

    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${dataset.value.id}`)
    }

    return sortOptions
  })

  const datasetVideoId = computed(() => route.params.datasetVideoId)

  const getDatasetItemFilter = (
    filter: Partial<V2DatasetItemFilter> = {}
  ): V2DatasetItemFilter | undefined => {
    if (!dataset.value) { return }

    const query = route.query

    const videoId = datasetVideoId.value ? parseInt(datasetVideoId.value) : null

    if (videoId && isNaN(videoId)) {
      dispatch(
        'toast/warning',
        { content: `Invalid Dataset video id "${videoId}"` }
      )
      return
    }

    if (!defaultSortOptions.value) { return }

    const baseFilter = getV2DatasetItemFilterFromRouteQuery(query, defaultSortOptions.value)
    const notStatuses = baseFilter?.not_statuses || []
    let statuses = baseFilter?.statuses

    if (!notStatuses.includes(DatasetItemStatus.processing)) {
      notStatuses.push(DatasetItemStatus.processing)
    }
    if (!notStatuses.includes(DatasetItemStatus.uploading)) {
      notStatuses.push(DatasetItemStatus.uploading)
    }
    if (!notStatuses.includes(DatasetItemStatus.archived)) {
      notStatuses.push(DatasetItemStatus.archived)
    }

    if (statuses?.includes(DatasetItemStatus.processing)) {
      statuses = statuses.filter(status => status !== DatasetItemStatus.processing)
    }
    if (statuses?.includes(DatasetItemStatus.uploading)) {
      statuses = statuses.filter(status => status !== DatasetItemStatus.uploading)
    }
    if (statuses?.includes(DatasetItemStatus.archived)) {
      statuses = statuses.filter(status => status !== DatasetItemStatus.archived)
    }

    const newFilter: V2DatasetItemFilter = {
      ...baseFilter,
      item_paths: folderEnabled.value ? [path.value] : undefined,
      types: videoId
        ? [DatasetItemType.image]
        : [
          DatasetItemType.image,
          DatasetItemType.video,
          DatasetItemType.pdf,
          DatasetItemType.dicom
        ],
      include_thumbnails: true,
      include_workflow_data: true,
      page: { size: 100 },
      statuses: statuses,
      not_statuses: notStatuses,
      ...filter
    }

    if (videoId) { newFilter.video_ids = [videoId] }
    return newFilter
  }

  const initLoader = async (): Promise<void> => {
    if (!dataset.value) { return }

    const datasetId = dataset.value.id
    const teamSlug = dataset.value.team_slug

    const filter = { ...getDatasetItemFilter() }
    delete filter.page
    delete filter.include_thumbnails
    delete filter.include_workflow_data

    dispatch('dataset/initV2DatasetItems', {
      datasetId,
      teamSlug,
      filter
    })

    await dispatch('dataset/setDatasetItemFilterV2', filter)

    const payload: StoreActionPayload<typeof loadV2DatasetItemCounts> = { dataset: dataset.value }
    dispatch('dataset/loadV2DatasetItemCounts', payload)
  }

  const getItem = (itemId: string): V2DatasetItemPayload | undefined => {
    return datasetItems.value[itemId]
  }

  const resolveSortBy = (sort: { [key: string]: 'asc' | 'desc' }): string => {
    return Object.keys(sort)[0]
  }

  const resolveItem = async (itemId: string): Promise<V2DatasetItemPayload | undefined> => {
    if (!dataset.value) { return }
    if (!itemId) { return }

    let item: V2DatasetItemPayload | undefined

    item = getItem(itemId)

    if (!item) {
      const teamSlug = dataset.value.team_slug
      const response = await dispatch('dataset/loadV2DatasetItem', {
        teamSlug,
        itemId
      })

      if (!response.data) { return }

      item = response.data
    }

    return item
  }

  const resolveFromQuery = async (itemId: string, filter: V2DatasetItemFilter): Promise<string> => {
    if (!filter.sort) { return itemId }

    const sortBy = resolveSortBy(filter.sort)

    switch (sortBy) {
    case 'updated_at': {
      const item = await resolveItem(itemId)
      if (!item) { return itemId }
      return `${item.updated_at},${itemId}`
    }
    case 'name': {
      const item = await resolveItem(itemId)
      if (!item) { return itemId }
      return `${item.name},${itemId}`
    }
    case 'byte_size': {
      const item = await resolveItem(itemId)
      if (!item) { return itemId }
      // For single item request API returns file size in metadata.size
      // For multiple files returns files[].size_bytes
      const fileSize = item.slots?.[0]?.metadata?.size || item.slots?.[0]?.size_bytes
      if (!fileSize) { return itemId }

      return `${fileSize},${itemId}`
    }
    case 'priority': {
      const item = await resolveItem(itemId)
      if (!item) { return itemId }
      return `${item.priority},${itemId}`
    }
    case 'id':
    default:
      return itemId
    }
  }

  const hasRange = (itemId: string, size: number): boolean => {
    const startIndex = state.dataset.datasetItemIdsV2.indexOf(itemId)

    if (startIndex < 0) { return false }

    for (let i = startIndex; i <= startIndex + size; i++) {
      const id = state.dataset.datasetItemIdsV2[i]
      if (!datasetItems.value[id]) { return false }
    }

    return true
  }

  const resolveItemsData = async (
    itemId: V2DatasetItemPayload['id'],
    size: number = 100
  ): Promise<void> => {
    if (!dataset.value) { return }

    if (hasRange(itemId, size)) { return }

    const filter = getDatasetItemFilter()

    if (!filter) { return }

    const from = await resolveFromQuery(itemId, filter)

    if (!from) { return }

    const datasetId = dataset.value.id
    const teamSlug = dataset.value.team_slug
    const response = await dispatch('dataset/loadV2DatasetItemsList', {
      datasetId,
      teamSlug,
      filter: {
        ...filter,
        not_statuses: [
          ...(filter.not_statuses || []),
          // workview doesn't support these statuses so we explictly exclude them here
          // we do this here because this way, they don't appear in the browser url
          DatasetItemStatus.processing,
          DatasetItemStatus.uploading,
          DatasetItemStatus.error
        ],
        page: {
          size,
          from
        }
      }
    })
    commit('dataset/SET_V2_DATASET_ITEMS', response.data.items)
  }

  /**
   * Called on destroy
   *
   * Ensures filters and folders are reset to initial state
   */
  const resetState = (): void => {
    if (!dataset.value) { return }
    // reset filter
    dispatch('dataset/setDatasetItemFilterV2', {})

    // reset folders
    commit('dataset/SET_DATASET_FOLDERS', {
      folders: [],
      datasetId: dataset.value.id
    })
  }

  return {
    initLoader,
    datasetItems,
    getDatasetItemFilter,
    resolveItemsData,
    resetState
  }
}
