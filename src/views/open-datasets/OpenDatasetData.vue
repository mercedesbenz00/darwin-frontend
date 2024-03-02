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
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Location } from 'vue-router'
import { State } from 'vuex-class'

import OpenDatasetDetailLayout from '@/components/Dataset/OpenDatasetDetail/OpenDatasetDetailLayout.vue'
import ReadOnlyContextMenu from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/ReadOnlyContextMenu/ReadOnlyContextMenu.vue'
import DatasetItemGallery from '@/components/DatasetManagement/Gallery/DatasetItemGallery.vue'
import DatasetChannelSubscriber from '@/components/DatasetManagement/Renderless/DatasetChannelSubscriber'
import DatasetItemsLoader from '@/components/DatasetManagement/Renderless/DatasetItemsLoader'
import OpenDataSidebar from '@/components/DatasetManagement/Sidebar/OpenDataSidebar.vue'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { DatasetPayload, RootState } from '@/store/types'

@Component({
  name: 'open-dataset-data',
  components: {
    DatasetChannelSubscriber,
    OpenDatasetDetailLayout,
    DatasetItemsLoader,
    DatasetItemGallery,
    OpenDataSidebar,
    ReadOnlyContextMenu
  },
  mixins: [BreadCrumbInitializer]
})
export default class OpenDatasetData extends Vue {
  // provided by parent route
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.folderEnabled)
  folderEnabled!: boolean

  get datasetName (): string {
    return this.dataset.name
  }

  get baseUrl () {
    return `/${this.dataset.team_slug}/${this.dataset.slug}`
  }

  get breadCrumbs (): BreadCrumb[] {
    const { query } = this.$route
    const pathSegments = this.path.split('/').slice(1).filter(segment => !!segment)
    const folderPathPrefix = `${this.baseUrl}/tree/`
    const folderBreadCrumbs = pathSegments.map((segment, index) => ({
      to: {
        path: folderPathPrefix + pathSegments.slice(0, index + 1).join('/'),
        query
      },
      name: segment
    }))

    return [
      { name: 'Datasets Overview' },
      { to: { path: this.baseUrl, query }, name: this.datasetName },
      ...folderBreadCrumbs
    ]
  }

  get path (): string {
    const { path } = this.$route.params
    if (!path) { return '/' }
    return `/${path}`
  }

  get parentType () {
    const { folderEnabled, path } = this
    if (folderEnabled && path !== '/') { return 'folder' }
    return null
  }

  get parentLocation (): Location | null {
    const { parentType, path } = this
    if (!parentType) { return null }

    const parentPath = path.split('/').slice(0, -1).join('/')
    const parentPathUrl = parentPath === '' || parentPath === '/'
      ? this.baseUrl
      : `${this.baseUrl}/tree${parentPath}`

    return { path: parentPathUrl, query: this.$route.query }
  }
}
</script>
