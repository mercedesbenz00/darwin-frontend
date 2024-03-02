<template>
  <dataset-detail-layout
    :dataset="dataset"
    :parent-type="parentType"
    :parent-location="parentLocation"
  >
    <template #content>
      <dataset-items-loader :dataset="dataset" />
      <dataset-channel-subscriber :dataset="dataset" />
      <billing-box
        v-if="showBillingBox"
        class="dataset-management-video__overlay"
      />
      <dataset-item-gallery
        class="dataset-management-video__gallery"
        :dataset="dataset"
      />
      <management-context-menu
        :dataset="dataset"
      />
    </template>
    <template #sidebar>
      <workflow-sidebar :dataset="dataset" />
    </template>
  </dataset-detail-layout>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import BillingBox from '@/components/Dataset/BillingBox.vue'
import DatasetDetailLayout from '@/components/Dataset/DatasetDetail/DatasetDetailLayout.vue'
import ManagementContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/ManagementContextMenu.vue'
import DatasetItemGallery from '@/components/DatasetManagement/Gallery/DatasetItemGallery.vue'
import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'
import DatasetItemsLoader from '@/components/DatasetManagement/Renderless/DatasetItemsLoader'
import WorkflowSidebar from '@/components/DatasetManagement/Sidebar/WorkflowSidebar.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import {
  DatasetPayload,
  DatasetItemPayload,
  RootState,
  TeamPayload
} from '@/store/types'
import { isDatasetInCurrentTeam } from '@/utils/dataset'

@Component({
  name: 'dataset-management-video',
  components: {
    BillingBox,
    DatasetChannelSubscriber,
    DatasetDetailLayout,
    DatasetItemGallery,
    DatasetItemsLoader,
    ManagementContextMenu,
    WorkflowSidebar
  },
  mixins: [BreadCrumbInitializer]
})
export default class DatasetManagementVideo extends Vue {
  // provided by parent route
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.currentDatasetVideoItem)
  datasetVideoItem!: DatasetItemPayload | null

  @State((state: RootState) => state.dataset.folderEnabled)
  folderEnabled!: boolean

  @State((state: RootState) => state.team.currentTeam)
  currentTeam!: TeamPayload | null

  get breadCrumbs (): BreadCrumb[] {
    const { query } = this.$route
    const crumbs: BreadCrumb[] = [
      { to: '/datasets', name: 'Datasets' },
      { to: `/datasets/${this.dataset.id}/overview`, name: this.dataset.name },
      { to: { path: `/datasets/${this.dataset.id}/dataset-management`, query }, name: 'Data' }
    ]
    if (this.datasetVideoItem) {
      const path = `/datasets/${this.dataset.id}/dataset-management/${this.datasetVideoId}`
      crumbs.push({
        to: { path, query },
        name: this.datasetVideoItem.dataset_video!.original_filename
      })
    }
    return crumbs
  }

  get datasetId (): number {
    return this.dataset.id
  }

  get datasetVideoId (): string {
    return this.$route.params.datasetVideoId
  }

  get parentType (): 'folder' | 'dataset' | null {
    const { datasetVideoItem, folderEnabled } = this
    if (!datasetVideoItem) { return null }
    if (datasetVideoItem.path !== '/' && folderEnabled) { return 'folder' }
    return 'dataset'
  }

  get parentLocation (): Location | null {
    const { datasetId, datasetVideoItem, parentType } = this
    if (!datasetVideoItem) { return null }
    const path = parentType === 'folder'
      ? `/datasets/${datasetId}/dataset-management/tree${datasetVideoItem.path}`
      : `/datasets/${datasetId}/dataset-management`
    return {
      path,
      query: this.$route.query
    }
  }

  /**
   * Billing box is shown the user is viewing datasets which are
   * part of the same team as they are.
   *
   * If there's no team, it means the user is viewing a publically
   * available dataset, so there's nothing to show.
   */
  get showBillingBox (): boolean {
    return isDatasetInCurrentTeam(this.dataset, this.currentTeam)
  }

  mounted (): void {
    this.fetchVideoInfo()
    this.fetchDatasetExports()

    this.$once('hook:beforeDestroy', () => this.resetState())
  }

  resetState (): void {
    this.$store.commit('dataset/SET_CURRENT_DATASET_VIDEO_ITEM', null)
  }

  @Watch('datasetVideoId')
  onDatasetVideoId (): void {
    // Refresh the dataset item counts when the video id changes only
    this.fetchVideoInfo()
  }

  /**
   * load the video information from the route params
   */
  async fetchVideoInfo (): Promise<void> {
    const params = { datasetId: this.datasetId, datasetVideoId: this.datasetVideoId }
    const { data } = await this.$store.dispatch('dataset/getVideoItemInfo', params)
    if (!data) {
      this.$router.replace({ name: 'DatasetManagementData' })
    }
  }

  async fetchDatasetExports (): Promise<void> {
    const { id, slug: datasetSlug, team_slug: teamSlug, version } = this.dataset
    if (version === 2) {
      await this.$store.dispatch('dataset/getV2Exports', { datasetSlug, teamSlug })
    } else {
      await this.$store.dispatch('dataset/getDatasetExports', { datasetId: id })
    }
  }
}
</script>

<style lang="scss" scoped>
.dataset-management-video__overlay {
  width: calc(100% - 90px);
}

.dataset-management-video__gallery {
  flex: 1;
  overflow-y: auto;
}
</style>
