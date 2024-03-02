import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  PageRegistry,
  Page,
  DEFAULT_ITEMS_PAGE_SIZE
} from '@/components/WorkView/BottomBar/pageRegistry'
import { DatasetItemCursorMapping } from '@/store/modules/workview/types'
import {
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetPayload,
  PagedApiResponse,
  PaginationParams,
  RootState,
  UserPayload
} from '@/store/types'
import {
  getDatasetDefaultSortOptions,
  getDatasetItemFilterFromRouteQuery,
  ParsedError
} from '@/utils'

/**
 * Route-based dataset items & folders loader.
 *
 * Loads items & folders in workflow workview, where the current item is specified
 * via query param or query string
 */
@Component({ name: 'items-loader' })
export default class ItemsLoader extends Vue {
  @Prop({ type: Boolean, default: false })
  openWorkMode!: boolean

  @State((state: RootState) => state.workview.dataset)
  dataset!: DatasetPayload

  @State((state: RootState) => state.workview.datasetItemCursorMappings)
  cursorMappings!: DatasetItemCursorMapping[]

  @State((state: RootState) => state.workview.datasetItemPageRegistry)
  pageRegistry!: PageRegistry

  @State((state: RootState) => state.workview.datasetItems)
  items!: DatasetItemPayload[]

  @State((state: RootState) => state.workview.datasetItemFilter)
  filter!: DatasetItemFilter

  @State((state: RootState) => state.workview.tutorialMode)
  tutorialMode!: boolean

  @State((state: RootState) => state.user.profile)
  user!: UserPayload

  // Determines if Open Dataset or not
  get isParamMode () {
    return 'datasetImageSeq' in this.$route.params
  }

  // Default sort options defined by dataset
  get defaultSortOptions () {
    const sortOptions = getDatasetDefaultSortOptions(this.dataset)
    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${this.dataset.id}`)
    }
    return sortOptions
  }

  // Current Sequence number from the route
  get currentSeq () {
    const { datasetImageSeq: paramsSeqStr } = this.$route.params
    const { image: querySeqStr } = this.$route.query

    // Check route params seq first and then query params seq
    const seqStr = paramsSeqStr || querySeqStr
    let seq: number | null = null
    if (
      seqStr &&
      (typeof seqStr === 'string' || typeof seqStr === 'number')
    ) {
      seq = parseInt(seqStr)
      if (isNaN(seq)) { seq = null }
    }

    return seq
  }

  async mounted () {
    /**
     * If the filter was not updated, it won't trigger the reload from scratch.
     * We need to reload again and update the currently selected item.
     */
    const filterUpdated = await this.resolveFilterFromRoute()
    if (!filterUpdated) {
      this.enqueueMainPage(true)
    }
    this.loadDatasetFolders()
  }

  /**
   * Dispatches workview/loadItems for each page in the page registry queue
   */
  async loadQueuedPages () {
    const { pageRegistry } = this
    this.resolvePageRegistryQueue()
    const promises = pageRegistry.queue.map(page => this.loadItems(page) as Promise<any>)

    for (const promise of promises) { await promise }

    this.$store.commit('workview/MERGE_DATASET_ITEM_PAGE_REGISTRY')
  }

  resolvePageRegistryQueue () {
    this.$store.commit('workview/RESOLVE_UNRESOLVED_PAGE_REGISTRY_QUEUE')
  }

  // When the routes are updated, update the store's dataset item filter
  @Watch('$route.query')
  onRouteUpdated () { this.resolveFilterFromRoute() }

  @Watch('filter')
  onFilter () { this.enqueueMainPage(true) }

  @Watch('currentSeq')
  onSeq () { this.enqueueMainPage() }

  /**
   * Resolves the filter from the route.
   * @returns {boolean} If the Dataset Item Filter has been updated or not
   */
  async resolveFilterFromRoute (): Promise<boolean> {
    const { defaultSortOptions, isParamMode, user, $route: { query } } = this

    // lack of user should not happen
    if (!isParamMode && !user) {
      throw new Error('WorkflowFilter: Expected annotator to be signed in')
    }

    const resolvedFilter = getDatasetItemFilterFromRouteQuery(query, defaultSortOptions)

    const filterUpdated =
      await this.$store.dispatch('workview/setDatasetItemFilter', resolvedFilter)

    return !!filterUpdated
  }

  /**
   * Builds approppriate page params and calls function to load page around the active image.
   */
  async enqueueMainPage (reset: boolean = false) {
    // If you select the existing item, no need to refetch everything
    if (!reset) {
      const existingItem = this.items.find(item => item.seq === this.currentSeq)
      if (existingItem) {
        this.$store.commit('workview/SET_SELECTED_DATASET_ITEM', existingItem)
        return
      }
    }

    this.$store.commit('workview/CLEAR_DATASET_ITEM_PAGE_REGISTRY')
    this.$store.commit('workview/RESET_DATASET_ITEM_CURSOR_MAPPING')
    this.$store.commit('workview/CLEAR_DATASET_ITEMS')

    let mainPageData: ParsedError | { data: PagedApiResponse<DatasetItemPayload> } =
      { data: { items: [], metadata: { next: null, previous: null } } }

    if (this.currentSeq !== null) {
      mainPageData = await this.loadCurrentSeqData(this.currentSeq)
    }

    if ('error' in mainPageData) { return }

    // If there is no item with the selected seq in the response,
    // load 50 items by default.
    if (mainPageData.data.items.length === 0) {
      mainPageData = await this.loadFirstPage()
    }

    if ('error' in mainPageData) { return }

    const { metadata: { next, previous } } = mainPageData.data
    this.selectItem()

    // If there is next page available, loads the next page
    if (next) {
      this.$store.commit('workview/ENQUEUE_DATASET_ITEM_PAGE', {
        from: next,
        size: DEFAULT_ITEMS_PAGE_SIZE
      })
    }

    // If there is previous page available, loads the previous page
    if (previous) {
      this.$store.commit('workview/ENQUEUE_DATASET_ITEM_PAGE', {
        to: previous,
        size: DEFAULT_ITEMS_PAGE_SIZE
      })
    }
  }

  async loadCurrentSeqData (seq: number) {
    const query = { datasetId: this.dataset.id }
    const page: PaginationParams = { contains_seq: seq }

    const { data, error } = await this.$store.dispatch(
      'workview/loadDatasetItems',
      { ...query, page, openWorkMode: this.openWorkMode }
    )
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return { error }
    }
    return { data }
  }

  loadFirstPage () {
    return this.loadItems({ size: DEFAULT_ITEMS_PAGE_SIZE })
  }

  selectItem (): void {
    const { items, currentSeq } = this
    if (items.length === 0) {
      // If zero items were loaded, show toast message
      this.$store.dispatch('toast/warning', {
        content: 'No items available for annotation in dataset.'
      })
      return
    }

    const item = items.find(i => i.seq === currentSeq)
    if (item) {
      this.$store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
      return
    }

    this.selectFirstItem()
  }

  selectFirstItem () {
    const { isParamMode, items } = this
    if (!items[0]) { return }
    const { params, query } = this.$route
    const image = items[0].seq.toString()
    if (isParamMode) {
      this.$router.replace({
        params: { ...params, image },
        query
      })
    } else {
      this.$router.replace({
        params,
        query: { ...query, image }
      })
    }
  }

  /**
   * Requests a section of images (`DatasetItem` records) from the store.
   */
  async loadItems (page: Page) {
    const query = { datasetId: this.dataset.id }
    const { data, error } = await this.$store.dispatch('workview/loadDatasetItems',
      { ...query, page, openWorkMode: this.openWorkMode })
    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return { error }
    }
    return { data }
  }

  async loadDatasetFolders () {
    if (this.tutorialMode) { return }
    const { error } = await this.$store.dispatch('workview/loadDatasetFolders')
    if (error) { this.$store.dispatch('toast/warning', { content: error.message }) }
  }

  @Watch('pageRegistry.queue')
  onQueue () {
    if (this.pageRegistry.queue.length === 0) { return }
    this.loadQueuedPages()
  }

  render () {
    return null
  }
}
