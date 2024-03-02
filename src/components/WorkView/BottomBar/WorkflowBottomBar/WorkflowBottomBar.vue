<template>
  <div class="workflow-bottom-bar">
    <bottom-bar
      :items="items"
      :selected-item="selectedItem"
      @page-changed="onPageChanged"
    >
      <template #item="{ item }">
        <workflow-image :dataset-item="item.data" />
      </template>
      <template #other>
        <more-work />
      </template>
    </bottom-bar>
    <preload-image :images="imagesToPreload" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import PreloadImage from '@/components/Common/PreloadImage.vue'
import {
  DEFAULT_ITEMS_PAGE_SIZE,
  resolvePageInformation,
  BottomBarItem,
  BottomBar,
  WorkflowImage,
  MoreWork
} from '@/components/WorkView/BottomBar'
import { DatasetItemCursorMapping, LoadedImage } from '@/store/modules/workview/types'
import { DatasetImagePayload, DatasetItemPayload } from '@/store/types'
import { isImageItem } from '@/utils'

@Component({
  name: 'workflow-bottom-bar',
  components: { BottomBar, MoreWork, PreloadImage, WorkflowImage }
})
export default class WorkflowBottomBar extends Vue {
  @State(state => state.workview.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State(state => state.workview.datasetItemsLoading)
  datasetItemsLoading!: boolean

  @State(state => state.workview.datasetItemCursorMappings)
  cursorMappings!: DatasetItemCursorMapping[]

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  @State(state => state.workview.loadedImages)
  loadedImages!: LoadedImage[]

  get requiresPreviousPageLoad (): boolean {
    const { cursorMappings } = this
    return cursorMappings.length === 0 ||
      (!!cursorMappings[0].previous && cursorMappings[0].ids.length >= DEFAULT_ITEMS_PAGE_SIZE)
  }

  get requiresNextPageLoad (): boolean {
    const { cursorMappings } = this
    return cursorMappings.length > 0 &&
      !!cursorMappings[cursorMappings.length - 1].next &&
      cursorMappings[0].ids.length >= DEFAULT_ITEMS_PAGE_SIZE
  }

  /**
   * Computes all items to be rendered in the scroller.
   *
   * This includes loaded images as well as placeholders for images in the progress of loading.
   */
  get items (): BottomBarItem[] {
    const { datasetItems, $can } = this
    const items: BottomBarItem[] = datasetItems.map(w => ({ data: w, id: w.seq.toString() }))

    if (this.requiresPreviousPageLoad) {
      items.unshift({ id: 'previous-page', loading: this.datasetItemsLoading })
    }

    if (this.requiresNextPageLoad) {
      items.push({ id: 'next-page', loading: this.datasetItemsLoading })
    }

    if ($can('request_work') && !$can('assign_items')) {
      const requestMoreId = '-999'
      items.push({ id: requestMoreId, size: 140 * this.$theme.getCurrentScale() })
    }

    return items
  }

  get selectedItem (): BottomBarItem | null {
    const { selectedDatasetItem } = this
    if (!selectedDatasetItem) { return null }
    return this.items.find(i => i.data && i.data.id === selectedDatasetItem.id) || null
  }

  // image preloading
  get imagesToPreload (): DatasetImagePayload[] {
    const { selectedDatasetItem, items, loadedImages } = this
    const loadableItems = items
      .filter((i): i is Omit<BottomBarItem, 'data'> & { data: DatasetItemPayload } => !!i.data)

    if (loadableItems.length === 0) { return [] }
    if (!selectedDatasetItem || !isImageItem(selectedDatasetItem)) { return [] }

    // ensure that main image has been loaded before preloading
    const mainImage = loadedImages
      .find(image => image.id === selectedDatasetItem.dataset_image.image.id)
    if (!mainImage || !mainImage.data) { return [] }

    const idx = loadableItems.findIndex(w => w.data.id === selectedDatasetItem.id)

    const preloadableItems = [
      // next one in carousel is highest priority
      loadableItems[idx + 1],
      // previous one in carousel is second in priority
      loadableItems[idx - 1],
      // 2 after next one follow
      loadableItems[idx + 2],
      loadableItems[idx + 3],
      // 2 before previous one right after
      loadableItems[idx - 2],
      loadableItems[idx - 3]
    ]
    return preloadableItems
      .map(i => !!i && i.data)
      .filter(isImageItem)
      .map(i => i.dataset_image)
  }

  onPageChanged (from: number, to: number): void {
    const fromWork = this.datasetItems[from]
    const toWork = this.datasetItems[to]
    if (!(fromWork && toWork)) { return }

    this.enqueueMore(toWork)
  }

  /**
   * Handles bottom bar changing it's scroll window
   *
   * Enqueues one or more page requests, depending on the scroll window.
   */
  enqueueMore (currentItem: DatasetItemPayload): void {
    const { cursorMappings } = this
    const pages = resolvePageInformation(cursorMappings, currentItem.id)
    pages.forEach((page) => this.$store.commit('workview/ENQUEUE_DATASET_ITEM_PAGE', page))
  }
}

</script>

<style lang="scss" scoped>
.workflow-bottom-bar {
  width: 100%;
  height: 100%;
}
</style>
