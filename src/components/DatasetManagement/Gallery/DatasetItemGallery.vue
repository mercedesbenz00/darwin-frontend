<template>
  <gallery
    loading-message="Fetching items"
    :empty-message="emptyMessage"
    :items="galleryItems"
    :fixed-column-count="columnCount"
    :calculate-card-proportion="calculateCardProportion"
    :view-mode="viewMode"
    :loading="!loaded && galleryItems.length === 0"
    :loaded="loaded"
    @select-all="setAllSelections"
  >
    <template #card="{ item: { data, type } }">
      <template v-if="type === 'item'">
        <open-dataset-item-card
          v-if="readonly"
          :data="data"
          :url-prefix="openDatasetUrlPrefix"
          @select="onSelect(data, $event)"
          @shift-select="onShiftSelect(data, $event)"
        />
        <dataset-item-card
          v-else
          :data="data"
          @select="onSelect(data, $event)"
          @shift-select="onShiftSelect(data, $event)"
        />
      </template>
      <template v-if="type === 'folder'">
        <dataset-folder-card
          :data="data"
          :readonly="readonly"
          :url-prefix="openDatasetUrlPrefix"
        />
      </template>
    </template>

    <template #list-item-header>
      <workflow-list-item-header :dataset="dataset" />
    </template>

    <template #list-item="{ item: { data, type } }">
      <template v-if="type === 'item'">
        <dataset-item-list-item
          :data="data"
          @select="onSelect(data, $event)"
          @shift-select="onShiftSelect(data, $event)"
        />
      </template>
      <template v-if="type === 'folder'">
        <dataset-folder-list-item
          :data="data"
          :readonly="readonly"
          :url-prefix="openDatasetUrlPrefix"
        />
      </template>
    </template>
  </gallery>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { State, Getter } from 'vuex-class'

import Gallery from '@/components/Common/Gallery/Gallery.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'
import DatasetFolderCard from '@/components/DatasetManagement/Card/V1/DatasetFolderCard.vue'
import DatasetItemCard from '@/components/DatasetManagement/Card/V1/DatasetItemCard.vue'
import OpenDatasetItemCard from '@/components/DatasetManagement/Card/V1/OpenDatasetItemCard.vue'
import DatasetFolderListItem from '@/components/DatasetManagement/ListItem/DatasetFolderListItem.vue'
import DatasetItemListItem from '@/components/DatasetManagement/ListItem/DatasetItemListItem/V1/DatasetItemListItem.vue'
import WorkflowListItemHeader from '@/components/DatasetManagement/ListItem/ListItemHeader/WorkflowListItemHeader.vue'
import { DatasetFolderPayload, DatasetItemPayload, DatasetPayload } from '@/store/types'
import { folderHasChildren } from '@/utils'

import { DATASET_CARD_IMAGE_PROPORTION, DATASET_CARD_DETAIL_HEIGHT } from './consts'

/**
 * Renders gallery in dataset management and open dataset tabs (base and video).
 *
 * Handles selection and shift selection.
 */
@Component({
  name: 'dataset-item-gallery',
  components: {
    Gallery,
    DatasetItemCard,
    DatasetFolderCard,
    OpenDatasetItemCard,
    DatasetFolderListItem,
    DatasetItemListItem,
    WorkflowListItemHeader
  }
})
export default class DatasetGallery extends Vue {
  @Prop({ required: true })
  dataset!: DatasetPayload

  @Prop({ type: Boolean, default: false })
  readonly!: boolean

  @State(state => state.dataset.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State(state => state.dataset.currentDataset.unfilteredItemCount)
  unfilteredItemCount!: number

  @State(state => state.dataset.datasetItemsLoaded)
  loaded!: boolean

  @State(state => state.dataset.selectedItemIds)
  selectedItemIds!: number[]

  @State(state => state.dataset.dataTabColumnCount)
  columnCount!: number

  @State(state => state.dataset.dataTabViewMode)
  viewMode!: VIEW_MODE

  @State(state => state.dataset.folderEnabled)
  folderEnabled!: boolean

  @Getter('currentPathFolder', { namespace: 'dataset' })
  currentFolder!: DatasetFolderPayload | null

  lastSelected: DatasetItemPayload | null = null

  get emptyMessage () {
    return this.unfilteredItemCount === 0
      ? 'No data has been added yet'
      : 'No data matches the current filters'
  }

  get galleryItems () {
    const galleryDatasetItems =
      this.datasetItems.map(item => ({ data: item, id: item.id, type: 'item' }))

    if (!this.folderEnabled) {
      return galleryDatasetItems
    }

    const galleryFolderItems = folderHasChildren(this.currentFolder)
      ? this.currentFolder!.children!.map(
        folder => ({ data: folder, id: folder.path, type: 'folder' })
      )
      : []
    return [...galleryFolderItems, ...galleryDatasetItems]
  }

  get openDatasetUrlPrefix (): string | null {
    if (!this.readonly) { return null }
    const { teamSlug, datasetSlug } = this.$route.params
    return `/${teamSlug}/${datasetSlug}`
  }

  mounted (): void {
    document.addEventListener('keydown', this.onKeyDown)
    this.$once('hook:beforeDestroy', () => document.removeEventListener('keydown', this.onKeyDown))
  }

  onKeyDown (event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault()
      event.stopPropagation()
      this.setAllSelections(true)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      this.setAllSelections(false)
    }
  }

  calculateCardProportion (cardWidth: number): number {
    // 9/15: this is proportion of the image
    // 60: the pixel height of the details part of the dataset card
    return cardWidth * DATASET_CARD_IMAGE_PROPORTION +
      DATASET_CARD_DETAIL_HEIGHT * this.$theme.getCurrentScale()
  }

  @Watch('datasetItems')
  onData (newData: DatasetItemPayload[], oldData: DatasetItemPayload[]): void {
    if (this.selectedItemIds.length > 0 && this.selectedItemIds.length === oldData.length) {
      this.setAllSelections(true)
    }
  }

  onSelect (item: DatasetItemPayload, selected: boolean): void {
    this.lastSelected = selected ? item : null
    this.$store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [item], selected })
  }

  /**
   * Triggers when a user holds shift while selecting or deselecting an image
   */
  onShiftSelect (item: DatasetItemPayload, selected: boolean): void {
    const { lastSelected, datasetItems } = this

    const currentSelectedIndex = datasetItems.findIndex(d => d.id === item.id)
    const lastSelectedIndex = lastSelected === null
      ? currentSelectedIndex
      : datasetItems.findIndex(d => d.id === lastSelected.id)
    const lowerBound = Math.min(lastSelectedIndex, currentSelectedIndex)
    const upperBound = Math.max(lastSelectedIndex, currentSelectedIndex)

    const selection = datasetItems.slice(lowerBound, upperBound + 1)

    this.$store.commit('dataset/UPDATE_ITEM_SELECTION', { items: selection, selected })
  }

  setAllSelections (selected: boolean): void {
    this.$store.commit('dataset/SET_SELECTED_ALL_ITEMS', selected)
  }
}
</script>
