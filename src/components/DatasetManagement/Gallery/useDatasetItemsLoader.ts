import { debounce } from 'lodash'
import { computed, watch, onBeforeMount, onBeforeUnmount, ref, Ref, WatchStopHandle } from 'vue'

import { SortOptions } from '@/components/DatasetFiltering/types'
import { useRoute, useRouter } from '@/composables/useRouter'
import { useStore } from '@/composables/useStore'
import { loadV2DatasetFolders } from '@/store/modules/dataset/actions/loadV2DatasetFolders'
import { loadV2DatasetItemCounts } from '@/store/modules/dataset/actions/loadV2DatasetItemCounts'
import { loadV2DatasetItemsList } from '@/store/modules/dataset/actions/loadV2DatasetItemsList'
import {
  DatasetPayload,
  DatasetItemStatus,
  StoreActionPayload,
  V2DatasetItemFilter,
  V2DatasetItemPayload
} from '@/store/types'
import {
  getV2DatasetDefaultSortOptions,
  getV2DatasetItemFilterFromRouteQuery
} from '@/utils'

export interface DatasetItemLoaderSetup {
  datasetItems: Ref<V2DatasetItemPayload[]>
  loading: Ref<boolean>
  loadData: (isStart: boolean, path?: string) => Promise<V2DatasetItemPayload[]>
  loadMore: (path?: string) => Promise<void>
  setDataset: (items: DatasetPayload) => void
  setDatasetItems: (items: V2DatasetItemPayload[]) => void
  startPolling: () => Promise<void>
  resetState: () => void
  resolveDatasetItemFilter: () => Promise<void>
}

export const useDatasetItemsLoader = (initialDataset: DatasetPayload): DatasetItemLoaderSetup => {
  const { commit, dispatch, state, getters } = useStore()
  const route = useRoute()
  const router = useRouter()
  const datasetItems = ref<V2DatasetItemPayload[]>([])
  const loading = ref<boolean>(false)
  const from = ref('')
  const totalCount = ref(0)

  let unwatchItems: WatchStopHandle[] = []

  const dataset = ref<DatasetPayload>(initialDataset)
  const setDataset = (newDataset: DatasetPayload): void => {
    dataset.value = newDataset
  }

  const currentPath: Ref<string | null> = computed(() => {
    return getters['dataset/currentPathV2']
  })

  const filter = computed(() => state.dataset.datasetItemFilterV2)

  const folderEnabled = computed(() => state.dataset.folderEnabled)

  const path = computed(() => {
    const { path } = route.params
    const hash = route.hash

    if (!path) { return '/' }

    if (hash !== undefined && hash !== null) {
      return `/${path}${hash}`
    }

    return `/${path}`
  })

  const datasetVideoId: Ref<string> = computed(() => route.params.datasetVideoId)

  const routeQuery = computed(() => route.query)

  const defaultSortOptions = computed<SortOptions>(() => {
    const sortOptions = getV2DatasetDefaultSortOptions(dataset.value)

    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${dataset.value.id}`)
    }

    return sortOptions
  })

  const defaultInvisibleStatusOptions =
    computed<DatasetItemStatus[]>(() => [DatasetItemStatus.archived])

  const getDatasetItemFilter = (): V2DatasetItemFilter | undefined => {
    const query = route.query

    let pathPrefix: string | undefined

    const videoId = datasetVideoId.value ? parseInt(datasetVideoId.value) : null

    if (videoId && isNaN(videoId)) {
      dispatch(
        'toast/warning',
        { content: `Invalid Dataset video id "${videoId}"` }
      )
      return
    }

    const baseFilter = getV2DatasetItemFilterFromRouteQuery(query, defaultSortOptions.value)
    if (folderEnabled.value) {
      pathPrefix = path.value
    }

    const newFilter: V2DatasetItemFilter = {
      ...baseFilter,
      item_path_prefix: pathPrefix
    }

    if (videoId) { newFilter.video_ids = [videoId] }
    return newFilter
  }

  const resolveDatasetItemFilter = async (): Promise<void> => {
    await dispatch('dataset/setDatasetItemFilterV2', getDatasetItemFilter())
  }

  const setDatasetItems = (items: V2DatasetItemPayload[]): void => {
    datasetItems.value = items
  }

  /**
   * Called when folders get disabled.
   *
   * If the router is currently on a folder route, it needs to be switched to
   * the root route
   */
  const maybeRedirectToRoot = (): void => {
    if (folderEnabled.value) { return }

    const inSubfolder = route.name === 'DatasetManagementFolderData'
    if (!inSubfolder) { return }

    router.push({ ...route, name: 'DatasetManagementData' })
  }

  const loadData = async (
    isStart: boolean = false,
  ): Promise<V2DatasetItemPayload[]> => {
    const datasetId = dataset.value.id
    const teamSlug = dataset.value.team_slug
    const itemFilter = state.dataset.datasetItemFilterV2
    const itemPaths = itemFilter?.item_paths || []

    // When in folder view (and only then) we never do any GET /items requests to backend
    // unless current root matches any of entered by user paths and assume empty result.
    // For example, if current paths filter is [/test/folder1, /test/folder2]
    // we only request fetching items if current root on UI is one of those two.

    let ignoreFetchItems = false
    if (folderEnabled.value) {
      if (itemPaths && itemPaths.length) {
        ignoreFetchItems = itemPaths.filter(itemPath => itemPath === currentPath.value).length === 0
      }

      if (!itemPaths.includes(path.value)) {
        itemPaths.push(path.value)
      }
    }

    const params: StoreActionPayload<typeof loadV2DatasetItemsList> = {
      datasetId,
      teamSlug,
      filter: {
        ...itemFilter,
        item_path_prefix: undefined,
        item_paths: folderEnabled.value ? itemPaths : undefined,
        include_thumbnails: true,
        include_tags: true,
        include_workflow_data: true,
        page: { size: 100, from: from.value || undefined }
      }
    }

    if (params.filter && !params.filter.statuses && !params.filter.not_statuses) {
      params.filter.not_statuses = defaultInvisibleStatusOptions.value
    }
    loading.value = true

    if (!ignoreFetchItems) {
      const response = await dispatch('dataset/loadV2DatasetItemsListThrottled', params)
      if (response && !response.error) {
        const { data } = response
        if (isStart) {
          datasetItems.value = data.items
        } else {
          datasetItems.value = datasetItems.value.concat(data.items)
        }

        totalCount.value = data.page.count
        from.value = data.page.next
        loading.value = false
        return data.items
      }
    }

    loading.value = false
    return []
  }

  const loadMore = async (): Promise<void> => {
    if (!loading.value && from.value) {
      await loadData(false)
    }
  }

  const startPolling = async (): Promise<void> => {
    from.value = ''
    totalCount.value = 0
    datasetItems.value = []
    await loadData(true)
  }

  const loadCounts = (): void => {
    const payload: StoreActionPayload<typeof loadV2DatasetItemCounts> = {
      dataset: dataset.value
    }
    dispatch('dataset/loadV2DatasetItemCountsThrottled', payload)
  }

  const maybeLoadFolders = (): void => {
    const datasetId = dataset.value.id
    const payload: StoreActionPayload<typeof loadV2DatasetFolders> = {
      datasetId,
      teamSlug: dataset.value.team_slug
    }
    dispatch('dataset/loadV2DatasetFoldersThrottled', payload)
  }

  /**
   * Called on destroy
   *
   * Ensures filters and folders are reset to initial state
   */
  const resetState = (): void => {
    // reset filter
    dispatch('dataset/setDatasetItemFilterV2', {})

    // reset folders
    commit('dataset/SET_DATASET_FOLDERS', {
      folders: [],
      datasetId: dataset.value.id
    })
  }

  const reloadAllItems = debounce(() => {
    commit('dataset/DESELECT_ALL_ITEMS')

    const filtersActive = Object.keys(filter.value).length > 0
    if (!filtersActive) { return }

    startPolling()

    loadCounts()
    maybeLoadFolders()
    maybeRedirectToRoot()
  }, 300)

  onBeforeMount(() => {
    // route watchers
    unwatchItems.push(
      watch(routeQuery, () => {
        resolveDatasetItemFilter()
      })
    )

    unwatchItems.push(
      watch(datasetVideoId, () => {
        resolveDatasetItemFilter()
      })
    )

    unwatchItems.push(
      watch(path, () => {
        resolveDatasetItemFilter()
      })
    )

    unwatchItems.push(
      watch(folderEnabled, () => {
        resolveDatasetItemFilter()

        startPolling()

        loadCounts()
        maybeLoadFolders()
        maybeRedirectToRoot()
      })
    )

    unwatchItems.push(
      watch(() => filter.value, () => {
        reloadAllItems()
      })
    )

    unwatchItems.push(
      watch(() => dataset.value, () => {
        reloadAllItems()
      })
    )
  })

  onBeforeUnmount(() => {
    unwatchItems.forEach(unwatch => !!unwatch && unwatch())
    unwatchItems = []
  })

  return {
    datasetItems,
    loading,
    loadMore,
    resetState,
    resolveDatasetItemFilter,
    setDataset,
    setDatasetItems,
    startPolling,
    loadData
  }
}
