import { Vue, Component, Watch, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { SortOptions } from '@/components/DatasetFiltering/types'
import {
  loadAllDatasetItems,
  restartLoadingAllDatasetItems,
  stopLoadingAllDatasetItems
} from '@/store/modules/dataset/actions/loadAllDatasetItems'
import { loadDatasetFolders } from '@/store/modules/dataset/actions/loadDatasetFolders'
import { loadDatasetItemCounts } from '@/store/modules/dataset/actions/loadDatasetItemCounts'
import {
  DatasetItemFilter,
  DatasetItemType,
  DatasetPayload,
  RootState,
  StoreActionPayload
} from '@/store/types'
import { getDatasetDefaultSortOptions, getDatasetItemFilterFromRouteQuery } from '@/utils'

/**
 * Loads dataset items & dataset item counts from the route query
 *
 * ## General behavior
 *
 * 1. We watch route param/query changes, recompute active dataset filter and
 * push it into the store.
 * 2. We watch dataset filter changes, as well as changes to folder view mode
 * and trigger appropriate reloads
 *
 * Renderless component
 */
@Component({ name: 'dataset-items-loader' })
export default class DatasetItemsLoader extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.datasetItemFilter)
  filter!: DatasetItemFilter

  @State(state => state.dataset.folderEnabled)
  folderEnabled!: boolean

  get path (): string {
    const { path } = this.$route.params
    const hash = this.$route.hash

    if (!path) { return '/' }

    if (hash !== undefined && hash !== null) {
      return `/${path}${hash}`
    }

    return `/${path}`
  }

  get datasetVideoId (): string | undefined {
    return this.$route.params.datasetVideoId
  }

  async mounted (): Promise<void> {
    await this.resolveDatasetItemFilter()
  }

  async beforeDestroy (): Promise<void> {
    this.resetState()
    await this.stopPolling()
  }

  get defaultSortOptions (): SortOptions {
    const { dataset } = this
    const sortOptions = getDatasetDefaultSortOptions(dataset)

    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${dataset.id}`)
    }

    return sortOptions
  }

  // route watchers

  @Watch('$route.query')
  onRouteUpdated (): void {
    this.resolveDatasetItemFilter()
  }

  @Watch('datasetVideoId')
  onDatasetVideoId (): void {
    this.resolveDatasetItemFilter()
  }

  @Watch('path')
  onPath (): void {
    this.resolveDatasetItemFilter()
  }

  async resolveDatasetItemFilter (): Promise<void> {
    const { defaultSortOptions, $route: { query } } = this

    const datasetVideoId = this.datasetVideoId ? parseInt(this.datasetVideoId) : null

    if (datasetVideoId && isNaN(datasetVideoId)) {
      this.$store.dispatch(
        'toast/warning',
        { content: `Invalid Dataset video id "${datasetVideoId}"` }
      )
      return
    }

    const newFilter: DatasetItemFilter = {
      ...getDatasetItemFilterFromRouteQuery(query, defaultSortOptions),
      path: this.path,
      types: datasetVideoId
        ? [DatasetItemType.videoFrame]
        : [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.splitVideo]
    }

    if (datasetVideoId) { newFilter.video_ids = [datasetVideoId] }

    await this.$store.dispatch('dataset/setDatasetItemFilter', newFilter)
  }

  // state watchers

  @Watch('filter')
  onItemFilter (newFilter: DatasetItemFilter, oldFilter: DatasetItemFilter): void {
    const isFirstRun = Object.keys(oldFilter).length === 0

    this.$store.commit('dataset/DESELECT_ALL_ITEMS')

    if (isFirstRun) {
      this.startPolling()
    } else {
      this.restartPolling()
    }

    this.loadCounts()
    this.maybeLoadFolders()
    this.maybeRedirectToRoot()
  }

  @Watch('folderEnabled')
  onFolderEnabled (): void {
    this.restartPolling()

    this.loadCounts()
    this.maybeLoadFolders()
    this.maybeRedirectToRoot()
  }

  startPolling (): void {
    const datasetId = this.dataset.id
    const params: StoreActionPayload<typeof loadAllDatasetItems> = { datasetId }

    this.$store.commit('dataset/SET_DATASET_ITEMS_LOADING')
    this.$store.commit('dataset/SET_DATASET_ITEMS', [])

    this.$store.dispatch('dataset/loadAllDatasetItems', params)
  }

  stopPolling (): void {
    const datasetId = this.dataset.id
    const params: StoreActionPayload<typeof stopLoadingAllDatasetItems> = { datasetId }
    this.$store.dispatch('dataset/stopLoadingAllDatasetItems', params)
  }

  restartPolling (): void {
    const datasetId = this.dataset.id
    const params: StoreActionPayload<typeof restartLoadingAllDatasetItems> = { datasetId }
    this.$store.dispatch('dataset/restartLoadingAllDatasetItems', params)
  }

  loadCounts (): void {
    const payload: StoreActionPayload<typeof loadDatasetItemCounts> = {
      dataset: this.dataset
    }
    this.$store.dispatch('dataset/loadDatasetItemCountsThrottled', payload)
  }

  maybeLoadFolders (): void {
    const { datasetVideoId } = this
    if (datasetVideoId) { return }
    const datasetId = this.dataset.id
    const payload: StoreActionPayload<typeof loadDatasetFolders> = { datasetId }
    this.$store.dispatch('dataset/loadDatasetFoldersThrottled', payload)
  }

  /**
   * Called on destroy
   *
   * Ensures filters and folders are reset to initial state
   */
  resetState (): void {
    // reset filter
    this.$store.dispatch('dataset/setDatasetItemFilter', {})

    // reset folders
    this.$store.commit('dataset/SET_DATASET_FOLDERS', {
      folders: [],
      datasetId: this.dataset.id
    })
  }

  /**
   * Called when folders get disabled.
   *
   * If the router is currently on a folder route, it needs to be switched to
   * the root route
   */
  maybeRedirectToRoot (): void {
    const { folderEnabled, $route } = this
    if (folderEnabled) { return }

    const inSubfolder = $route.name === 'DatasetManagementFolderData'
    if (!inSubfolder) { return }

    this.$router.push({ ...this.$route, name: 'DatasetManagementData' })
  }

  render (): null {
    return null
  }
}
