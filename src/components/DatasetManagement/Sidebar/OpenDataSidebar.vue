<template>
  <sidebar>
    <div class="data-sidebar__content">
      <export-button
        ref="exportButton"
        is-open-mode
        class="data-sidebar__export"
      />
      <div class="data-sidebar__control">
        <gallery-control class="data-sidebar__gallery-control" />
        <switch-folder-mode class="dataset-sidebar__switch-folder" />
      </div>
      <sort-control
        class="data-sidebar__sort"
        :sort-by="activeSortBy"
        :sort-direction="activeSortDirection"
        @change="onSortUpdated"
      />
      <status-filter
        class="data-sidebar__status"
        is-open-mode
        :commented.sync="editingDatasetItemFilter.has_comments"
        :positive-statuses.sync="editingDatasetItemFilter.statuses"
        :negative-statuses.sync="editingDatasetItemFilter.not_statuses"
        @change="onFilterUpdated"
      />
      <class-filter
        class="data-sidebar__tags"
        :dataset="dataset"
        list-only
        :positive-class-ids.sync="editingDatasetItemFilter.annotation_class_ids"
        :negative-class-ids.sync="editingDatasetItemFilter.not_annotation_class_ids"
        @change="onFilterUpdated"
      />
    </div>
  </sidebar>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import SortControl from '@/components/DatasetFiltering/SortControl.vue'
import { SortOptions } from '@/components/DatasetFiltering/types'
import DataTabUpload from '@/components/DatasetManagement/DatasetTabUpload/DataTabUpload.vue'
import ExportButton from '@/components/DatasetManagement/ExportButton/ExportButton.vue'
import { DatasetItemFilter, DatasetPayload, RootState } from '@/store/types'
import {
  getDatasetDefaultSortOptions,
  getDatasetItemFilterFromRouteQuery,
  getRouteQueryFromDatasetItemFilter
} from '@/utils'

import ClassFilter from './ClassFilter.vue'
import GalleryControl from './GalleryControl.vue'
import Sidebar from './Sidebar.vue'
import StatusFilter from './StatusFilter.vue'
import SwitchFolderMode from './SwitchFolderMode.vue'

@Component({
  name: 'open-data-tab-sidebar',
  components: {
    ClassFilter,
    DataTabUpload,
    ExportButton,
    GalleryControl,
    Sidebar,
    SortControl,
    StatusFilter,
    SwitchFolderMode
  }
})
export default class OpenDataTabSidebar extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.datasetItemFilter)
  datasetItemFilter!: DatasetItemFilter

  $refs!: {
    exportButton: ExportButton
  }

  editingDatasetItemFilter: DatasetItemFilter = {}

  @Watch('$route.query.export', { immediate: true })
  onExportParam (value: null | undefined | string) {
    if (value === undefined) { return }
    this.$nextTick(() => this.$refs.exportButton.openExportDialog())
  }

  // Filtering management
  get defaultSortOptions () {
    const sortOptions = getDatasetDefaultSortOptions(this.dataset)
    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${this.dataset.id}`)
    }
    return sortOptions
  }

  get activeSortBy () {
    const { sort } = this.editingDatasetItemFilter
    const { sortBy: defaultSortBy } = this.defaultSortOptions
    if (!sort) { return defaultSortBy }
    return Object.keys(sort)[0] || defaultSortBy
  }

  get activeSortDirection (): 'asc' | 'desc' {
    const { sort } = this.editingDatasetItemFilter
    const { sortDirection: defaultSortDirection } = this.defaultSortOptions
    if (!sort) { return defaultSortDirection as 'asc' | 'desc' }
    return Object.values(sort)[0] || defaultSortDirection
  }

  @Watch('datasetItemFilter', { immediate: true })
  onDatasetItemFilter () {
    this.editingDatasetItemFilter = {
      sort: this.defaultSortOptions.sort,
      ...this.datasetItemFilter
    }
  }

  get queryParams () {
    return getRouteQueryFromDatasetItemFilter(
      this.$route.query,
      this.editingDatasetItemFilter
    )
  }

  onSortUpdated (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void {
    const { sortBy, sortDirection } = params
    this.editingDatasetItemFilter.sort = {
      [sortBy]: sortDirection
    }
    this.onFilterUpdated()
  }

  // When filter is updated, navigate to the proper routes
  onFilterUpdated (): void {
    this.$router.push({
      query: this.queryParams
    })
  }

  // When the routes are updated, update the store's dataset item filter
  @Watch('$route.query', { immediate: true })
  async onRouteUpdated (): Promise<void> {
    const { defaultSortOptions, $route: { query } } = this
    const newFilter = {
      ...this.datasetItemFilter,
      ...getDatasetItemFilterFromRouteQuery(query, defaultSortOptions)
    }

    await this.$store.dispatch('dataset/setDatasetItemFilter', newFilter)
  }
}
</script>

<style lang="scss" scoped>
.data-sidebar__content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(3, auto) repeat(2, minmax(0, 1fr));
}

.data-sidebar__upload {
  margin-bottom: 10px;
}

.data-sidebar__export {
  margin-bottom: 18px;
}

.data-sidebar__control {
  margin-bottom: 18px;
  @include row--center;
}

.data-sidebar__gallery-control {
  flex: 1;
}

.data-sidebar__layout {
  margin-left: 15px;
}

.data-sidebar__sort {
  margin-bottom: 5px;
}

.data-sidebar__annotator {
  margin-bottom: 5px;
}

.data-sidebar__status {
  @include scrollbar;
  margin-bottom: 10px;
  justify-content: flex-start;
  overflow-y: auto;
}

.data-sidebar__tags {
  justify-content: flex-start;
  overflow-y: auto;
}
</style>
