<template>
  <open-dataset-detail-layout
    :dataset="dataset"
    :parent-type="parentType"
    :parent-location="parentLocation"
  >
    <template #content>
      <dataset-items-loader :dataset="dataset" />
      <dataset-channel-subscriber :dataset="dataset" />
      <dataset-item-gallery
        readonly
        :dataset="dataset"
      />
      <read-only-context-menu />
    </template>

    <template #sidebar>
      <open-data-sidebar :dataset="dataset" />
    </template>
  </open-dataset-detail-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import OpenDatasetDetailLayout from '@/components/Dataset/OpenDatasetDetail/OpenDatasetDetailLayout.vue'
import ReadOnlyContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/ReadOnlyContextMenu/ReadOnlyContextMenu.vue'
import DatasetItemGallery from '@/components/DatasetManagement/Gallery/DatasetItemGallery.vue'
import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'
import DatasetItemsLoader from '@/components/DatasetManagement/Renderless/DatasetItemsLoader'
import OpenDataSidebar from '@/components/DatasetManagement/Sidebar/OpenDataSidebar.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { DatasetPayload, DatasetItemPayload } from '@/store/types'

@Component({
  name: 'open-dataset-video',
  components: {
    DatasetChannelSubscriber,
    DatasetItemGallery,
    DatasetItemsLoader,
    OpenDatasetDetailLayout,
    OpenDataSidebar,
    ReadOnlyContextMenu
  },
  mixins: [BreadCrumbInitializer]
})
export default class OpenDatasetVideo extends Vue {
  // provided by parent route
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State(state => state.dataset.currentDatasetVideoItem)
  datasetVideoItem!: DatasetItemPayload | null

  @State(state => state.dataset.folderEnabled)
  folderEnabled!: boolean

  get baseUrl () {
    return `/${this.dataset.team_slug}/${this.dataset.slug}`
  }

  get breadCrumbs (): BreadCrumb[] {
    const { query } = this.$route
    const crumbs: BreadCrumb[] = [
      { name: 'Datasets Overview' },
      { to: this.baseUrl, name: this.dataset.name }
    ]
    if (this.datasetVideoItem) {
      crumbs.push({
        to: { path: `${this.baseUrl}/videos/${this.datasetVideoId}`, query },
        name: this.datasetVideoItem.dataset_video!.original_filename
      })
    }
    return crumbs
  }

  get datasetVideoId () {
    return this.$route.params.datasetVideoId
  }

  get datasetId () {
    return this.dataset.id
  }

  get parentType () {
    const { datasetVideoItem, folderEnabled } = this
    if (!datasetVideoItem) { return null }
    if (datasetVideoItem.path !== '/' && folderEnabled) { return 'folder' }
    return 'dataset'
  }

  get parentLocation (): Location | null {
    const { baseUrl, datasetVideoItem, parentType } = this
    if (!datasetVideoItem) { return null }
    const parentUrl = parentType === 'folder'
      ? `${baseUrl}/tree${datasetVideoItem.path}`
      : baseUrl

    return {
      path: parentUrl,
      query: this.$route.query
    }
  }

  mounted (): void {
    this.fetchVideoInfo()
    this.$once('hook:beforeDestroy', () => this.resetState())
  }

  resetState (): void {
    this.$store.commit('dataset/SET_CURRENT_DATASET_VIDEO_ITEM', null)
  }

  @Watch('datasetVideoId')
  onDatasetVideoId () {
    this.fetchVideoInfo()
  }

  async fetchVideoInfo () {
    const params = { datasetId: this.datasetId, datasetVideoId: this.datasetVideoId }
    const { data } = await this.$store.dispatch('dataset/getVideoItemInfo', params)
    if (!data) {
      this.$router.replace({ name: 'OpenDatasetData' })
    }
  }
}
</script>
