<template>
  <sidebar>
    <div class="data-sidebar__content">
      <data-tab-upload class="data-sidebar__upload" />
      <export-button
        ref="exportButton"
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
      <generic-filter
        class="data-sidebar__generic"
        :dataset="dataset"
        :positive-assignees.sync="editingFilter.current_assignees"
        :negative-assignees.sync="editingFilter.not_current_assignees"
        :positive-filenames.sync="editingFilter.filenames"
        :negative-filenames.sync="editingFilter.not_filenames"
        :positive-paths.sync="editingFilter.paths"
        :negative-paths.sync="editingFilter.not_paths"
        @change="onFilterUpdated"
      />
      <stage-filter
        :dataset="dataset"
        :included-ids="editingFilter.current_workflow_stage_ids"
        :excluded-ids="editingFilter.not_current_workflow_stage_ids"
        :workflow="workflow20"
        v-if="workflow20"
        @change="setStageFilters"
      />
      <stage-template-filter
        v-else
        class="data-sidebar__stage-template"
        :dataset="dataset"
        :positive-stage-template-ids.sync="editingFilter.workflow_stage_template_ids"
        :negative-stage-template-ids.sync="editingFilter.not_workflow_stage_template_ids"
        @change="onFilterUpdated"
      />
      <status-filter
        class="data-sidebar__status"
        :commented.sync="editingFilter.has_comments"
        :positive-statuses.sync="editingFilter.statuses"
        :negative-statuses.sync="editingFilter.not_statuses"
        @change="onFilterUpdated"
      />
      <class-filter
        class="data-sidebar__tags"
        :dataset="dataset"
        :positive-class-ids.sync="editingFilter.annotation_class_ids"
        :negative-class-ids.sync="editingFilter.not_annotation_class_ids"
        :images-selecting="selectedItems.length > 0"
        @change="onFilterUpdated"
      />
    </div>
  </sidebar>
</template>

<script lang="ts">
import { Dictionary, isEqual } from 'lodash'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import SortControl from '@/components/DatasetFiltering/SortControl.vue'
import { StageFilter, StageFilterChange } from '@/components/DatasetFiltering/StageFilter/V1'
import { SortOptions } from '@/components/DatasetFiltering/types'
import DataTabUpload from '@/components/DatasetManagement/DatasetTabUpload/DataTabUpload.vue'
import ExportButton from '@/components/DatasetManagement/ExportButton/ExportButton.vue'
import {
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetPayload,
  RootState,
  V2WorkflowPayload
} from '@/store/types'
import { getDatasetDefaultSortOptions, getRouteQueryFromDatasetItemFilter } from '@/utils'

import ClassFilter from './ClassFilter.vue'
import GalleryControl from './GalleryControl.vue'
import GenericFilter from './GenericFilter.vue'
import Sidebar from './Sidebar.vue'
import StageTemplateFilter from './StageTemplateFilter.vue'
import StatusFilter from './StatusFilter.vue'
import SwitchFolderMode from './SwitchFolderMode.vue'

@Component({
  name: 'workflow-sidebar',
  components: {
    ClassFilter,
    DataTabUpload,
    ExportButton,
    GalleryControl,
    GenericFilter,
    Sidebar,
    SortControl,
    StageFilter,
    StageTemplateFilter,
    StatusFilter,
    SwitchFolderMode
  }
})
export default class WorkflowSidebar extends Vue {
  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  @State((state: RootState) => state.dataset.datasetItemFilter)
  datasetItemFilter!: DatasetItemFilter

  @Getter('selectedItems', { namespace: 'dataset' })
  selectedItems!: DatasetItemPayload[]

  editingFilter: DatasetItemFilter = {}

  $refs!: {
    exportButton: ExportButton
  }

  @Watch('$route.query.export', { immediate: true })
  onExportParam (value: null | undefined | string): void {
    if (value === undefined) { return }
    this.$nextTick(() => this.$refs.exportButton.openExportDialog())
  }

  // Filtering management
  get defaultSortOptions (): SortOptions {
    const sortOptions = getDatasetDefaultSortOptions(this.dataset)
    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${this.dataset.id}`)
    }
    return sortOptions
  }

  get activeSortBy (): string {
    const { sort } = this.editingFilter
    const { sortBy: defaultSortBy } = this.defaultSortOptions
    if (!sort) { return defaultSortBy }
    return Object.keys(sort)[0] || defaultSortBy
  }

  get activeSortDirection (): 'asc' | 'desc' {
    const { sort } = this.editingFilter
    const { sortDirection: defaultSortDirection } = this.defaultSortOptions
    if (!sort) { return defaultSortDirection as 'asc' | 'desc' }
    return Object.values(sort)[0] || defaultSortDirection
  }

  @Watch('datasetItemFilter', { immediate: true })
  onDatasetItemFilter (): void {
    this.editingFilter = {
      sort: this.defaultSortOptions.sort,
      ...this.datasetItemFilter
    }
  }

  get queryParams (): Dictionary<string | (string | null)[]> {
    return getRouteQueryFromDatasetItemFilter(
      this.$route.query,
      this.editingFilter
    )
  }

  onSortUpdated (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void {
    const { sortBy, sortDirection } = params
    this.editingFilter.sort = {
      [sortBy]: sortDirection
    }
    this.onFilterUpdated()
  }

  // When filter is updated, navigate to the proper routes
  onFilterUpdated (): void {
    if (!isEqual(this.$route.query, this.queryParams)) {
      this.$router.push({
        query: this.queryParams
      })
    }
  }

  // workflows 2.0
  @Getter('getWorkflowByDatasetId', { namespace: 'v2Workflow' })
  getWorkflowByDatasetId!: (id: number) => V2WorkflowPayload | null

  get workflow20 (): V2WorkflowPayload | null {
    return this.getWorkflowByDatasetId(this.dataset.id)
  }

  setStageFilters (newFilters: StageFilterChange): void {
    this.editingFilter.current_workflow_stage_ids = newFilters.includedIds
    this.editingFilter.not_current_workflow_stage_ids = newFilters.excludedIds
    this.onFilterUpdated()
  }
}
</script>

<style lang="scss" scoped>
.data-sidebar__content {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: repeat(6, auto) minmax(100px, auto) minmax(200px, 1fr);
  row-gap: 10px;
}

.data-sidebar__control {
  @include row--center;
}

.data-sidebar__gallery-control {
  flex: 1;
}

.data-sidebar__status {
  @include scrollbar;
  justify-content: flex-start;
}

.data-sidebar__status,
.data-sidebar__tags {
  justify-content: flex-start;
  overflow-y: auto;
}

</style>
