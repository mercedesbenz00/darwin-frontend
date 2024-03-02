<template>
  <div
    class="workflow-filter"
    tabindex="0"
  >
    <custom-button
      v-tooltip="tooltip"
      class="workflow-filter__button"
      size="large"
      color="secondary"
      :disabled="totalFilters === 0"
      @click="onOpen"
    >
      <div class="workflow-filter__button__col1">
        <icon-mono-filter
          v-if="activeFilters"
          class="workflow-filter__button__icon"
        />
        <icon-duotone-sum
          v-else
          class="workflow-filter__button__icon"
        />
        <span class="workflow-filter__button__label">{{ filteredLabel }}</span>
      </div>
      <div class="workflow-filter__button__col2">
        <span
          v-if="totalFilters"
          class="workflow-filter__button__total"
        >
          {{ totalFilters }}
        </span>
        <icon-mono-chevron
          class="workflow-filter__button__chevron"
          :class="{ 'workflow-filter__button__chevron--open': open }"
        />
      </div>
    </custom-button>
    <popup-menu
      ref="popup-menu"
      v-if="open"
      class="popup-menu popup-menu-workflow-filters"
      :class="{ 'popup-menu--open': open }"
      :style="style"
      @click:outside="onClickOutside"
    >
      <div class="popup-menu__header">
        <folder-structure
          class="workflow-filter__folder-structure"
          :dataset="dataset"
        />
        <sort-control
          class="workflow-filter__sort"
          :sort-by="activeSortBy"
          :sort-direction="activeSortDirection"
          @change="onSortUpdated"
        />
      </div>
      <div class="popup-menu__content">
        <class-filter
          class="workflow-filter__classes"
          :positive-class-ids.sync="filters.annotation_class_ids"
          :negative-class-ids.sync="filters.not_annotation_class_ids"
          list-only
          @change="onFilterUpdated"
        />

        <div class="workflow-filter__generic-wrapper">
          <generic-filter
            v-if="adminMode"
            class="workflow-filter__generic"
            :dataset="dataset"
            :positive-assignees.sync="filters.current_assignees"
            :negative-assignees.sync="filters.not_current_assignees"
            :positive-filenames.sync="filters.filenames"
            :negative-filenames.sync="filters.not_filenames"
            :positive-paths.sync="filters.paths"
            :negative-paths.sync="filters.not_paths"
            @change="onFilterUpdated"
          />
        </div>
        <div class="workflow-filter__statuses-wrapper">
          <div class="workflow-filter__statuses">
            <stage-filter
              v-if="adminMode && workflow20"
              class="workflow-filter__stage"
              :dataset="dataset"
              :workflow="workflow20"
              :included-ids="filters.current_workflow_stage_ids"
              :excluded-ids="filters.not_current_workflow_stage_ids"
              @change="setStageFilters"
            />
            <stage-template-filter
              v-if="adminMode && !workflow20"
              class="workflow-filter__stage-template"
              :dataset="dataset"
              :positive-stage-template-ids.sync="filters.workflow_stage_template_ids"
              :negative-stage-template-ids.sync="filters.not_workflow_stage_template_ids"
              @change="onFilterUpdated"
            />
            <status-filter
              class="workflow-filter__status"
              :commented.sync="filters.has_comments"
              :positive-statuses.sync="filters.statuses"
              :negative-statuses.sync="filters.not_statuses"
              @change="onFilterUpdated"
            />
          </div>
        </div>
      </div>
      <div
        v-if="activeFilters"
        class="popup-menu__footer"
      >
        <custom-button
          flair="soft"
          size="medium"
          full-width
          @click="deselectAll"
        >
          Reset {{ activeFilters }} filter{{ activeFilters > 1 ? 's' : '' }}
        </custom-button>
      </div>
    </popup-menu>
  </div>
</template>

<script lang="ts">
import { Dictionary, isEqual } from 'lodash'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { XIcon } from '@/assets/icons/V1'
import { IconDuotoneSum } from '@/assets/icons/V2/Duotone'
import { IconMonoFilter, IconMonoChevron } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { StageFilter, StageFilterChange } from '@/components/DatasetFiltering/StageFilter/V1'
import { SortOptions } from '@/components/DatasetFiltering/types'
import { StatusButton } from '@/components/WorkView/Common/StatusButton/V2'
import {
  Breadcrumbs,
  ClassFilter,
  FolderStructure,
  GenericFilter,
  SortControl,
  StageTemplateFilter,
  StatusFilter
} from '@/components/WorkView/WorkflowFilter'
import {
  DatasetItemCountsPayload,
  DatasetItemStatus,
  DatasetItemFilter,
  DatasetPayload,
  V2WorkflowPayload
} from '@/store/types'
import { TooltipOptions } from '@/types'
import { getDatasetDefaultSortOptions, getRouteQueryFromDatasetItemFilter } from '@/utils'

/**
 * Implements the filter UI element in the bottom left of the workview.
 *
 * Intended to share as much code with the sidebar filters on the data tab as possible,
 * so this is the direction further modification of this component should go in.
 */
@Component({
  name: 'workflow-filter',
  components: {
    Breadcrumbs,
    ClassFilter,
    CustomButton,
    FolderStructure,
    GenericFilter,
    IconDuotoneSum,
    IconMonoChevron,
    IconMonoFilter,
    PopupMenu,
    SortControl,
    StatusButton,
    StageFilter,
    StageTemplateFilter,
    StatusFilter,
    XIcon
  }
})
export default class WorkflowFilter extends Vue {
  @Prop({ default: 48, type: Number })
  parentHeight!: number

  @State(state => state.workview.datasetItemCounts)
  counts!: DatasetItemCountsPayload | null

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  @State(state => state.workview.datasetItemFilter)
  datasetItemFilter!: DatasetItemFilter

  // WF2.0
  @Getter('getWorkflowByDatasetId', { namespace: 'v2Workflow' })
  getWorkflowByDatasetId!: (id: number) => V2WorkflowPayload | null

  open: boolean = false
  filters: DatasetItemFilter = {}

  // Determines how the component will be rendered (full vs status filter only)
  // as well as which counts are fetched from backend.
  get adminMode (): boolean {
    return !!this.$can('view_full_datasets')
  }

  get selectedStatuses (): DatasetItemStatus[] {
    return this.datasetItemFilter.statuses || []
  }

  get queryParams (): Dictionary<string | (string | null)[]> {
    return getRouteQueryFromDatasetItemFilter(
      this.$route.query,
      this.filters
    )
  }

  // WF2.0
  get workflow20 (): V2WorkflowPayload | null {
    return this.getWorkflowByDatasetId(this.dataset.id)
  }

  // Filtering management
  get totalFilters (): number {
    return this.counts?.item_count || 0
  }

  get activeFilters (): number {
    return Object.entries(this.filters)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .reduce((acc, [_, value]) => {
        if (typeof value === 'boolean') { acc += 1 }
        if (Array.isArray(value)) { acc += value.length }
        return acc
      }, 0)
  }

  get filteredLabel (): string {
    const count: number = this.activeFilters
    return !this.totalFilters || count === 0
      ? 'All'
      : `${count} Filter${count > 1 ? 's' : ''}`
  }

  get tooltip (): TooltipOptions {
    const total = this.totalFilters
    return {
      placement: 'top',
      content: total === 0
        ? 'No filters available'
        : `Filter images (${total} available)`,
      classes: 'tooltip--status',
      delay: { show: 300, hide: 300 }
    }
  }

  get style (): Record<string, string> {
    const maxHeightDelta = 8 + 54 * this.$theme.getCurrentScale() + this.parentHeight
    return {
      'max-height': `calc(100vh - ${maxHeightDelta}px)`,
      bottom: `${this.parentHeight}px`
    }
  }

  get defaultSortOptions (): SortOptions {
    const sortOptions = getDatasetDefaultSortOptions(this.dataset)
    if (!sortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${this.dataset.id}`)
    }
    return sortOptions
  }

  get activeSortBy (): string {
    const { sort } = this.filters
    const { sortBy: defaultSortBy } = this.defaultSortOptions
    if (!sort) { return defaultSortBy }
    return Object.keys(sort)[0] || defaultSortBy
  }

  get activeSortDirection (): 'asc' | 'desc' {
    const { sort } = this.filters
    const { sortDirection: defaultSortDirection } = this.defaultSortOptions
    if (!sort) { return defaultSortDirection as 'asc' | 'desc' }
    return Object.values(sort)[0] || defaultSortDirection
  }

  @Watch('datasetItemFilter', { immediate: true })
  onDatasetItemFilter (): void {
    this.filters = {
      sort: this.defaultSortOptions.sort,
      ...this.datasetItemFilter
    }
  }

  onOpen (): void {
    setTimeout(() => {
      this.$emit(this.open ? 'close' : 'open')
      this.open = !this.open
    }, 100)
  }

  onClose (): void {
    setTimeout(() => {
      this.$emit('close')
      this.open = false
    }, 100)
  }

  onClickOutside (): void {
    if (!this.open) { return }
    this.onClose()
  }

  deselectAll (): void {
    this.filters.annotation_class_ids = []
    this.filters.not_annotation_class_ids = []
    this.filters.current_assignees = []
    this.filters.not_current_assignees = []
    this.filters.filenames = []
    this.filters.not_filenames = []
    this.filters.has_comments = false
    this.filters.paths = []
    this.filters.not_paths = []
    this.filters.statuses = []
    this.filters.not_statuses = []
    this.filters.workflow_stage_template_ids = []
    this.filters.not_workflow_stage_template_ids = []
    this.filters.current_workflow_stage_ids = []
    this.filters.not_current_workflow_stage_ids = []
    this.onFilterUpdated()
  }

  // When sort options changes
  onSortUpdated (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void {
    const { sortBy, sortDirection } = params
    this.filters.sort = { [sortBy]: sortDirection }
    this.onFilterUpdated()
  }

  // When filter is updated, navigate to the proper routes
  onFilterUpdated (): void {
    if (!isEqual(this.$route.query, this.queryParams)) {
      this.$router.push({ query: this.queryParams })
    }
  }

  setStageFilters ({ includedIds, excludedIds }: StageFilterChange): void {
    this.filters.current_workflow_stage_ids = includedIds
    this.filters.not_current_workflow_stage_ids = excludedIds
    this.onFilterUpdated()
  }
}
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu.popup-menu-workflow-filters {
  @include scrollbarV2;

  .menu__wrapper {
    @include col;
    padding: 0;
  }
}
</style>

<style lang="scss" scoped>
.workflow-filter {
  position: relative;
  @include col;
  $height: 52px;

  // trigger button
  &__button {
    position: relative;
    height: $height;
    width: 160px !important;
    padding: 0 8px !important;
    background-color: $colorWhite !important;

    &[disabled] {
      opacity: 0.3;
    }

    &:deep(.custom-button__label) {
      display: flex;
      justify-content: space-between !important;
      width: 100%;

      .workflow-filter__button__col1,
      .workflow-filter__button__col2 {
        @include row;
        align-items: center;
        gap: 4px;
      }
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      @include fullsize;
      border-radius: $border-radius-default;
      z-index: 1;
    }

    &:hover {
      background-color: $colorOverlayHover !important;
    }

    &:focus {
      background-color: $colorWhite !important;

      &::after {
        border: 2px solid $colorInteractivePrimaryDefault;
      }
    }

    &__label,
    &__total {
      @include typography(md-1, inter, 500);
      color: $colorNeutrals700;
      z-index: 3;
    }

    &__chevron {
      transition: transform .150s ease-in-out;

      &--open {
        transform: rotate(180deg);
      }

      path {
        fill: $colorNeutrals300;
      }
    }
  }

  &__sort {
    width: 100%;

    &:deep(.sort-dropdown__input) {
      &,
      .select-field {
        width: 100%;
      }

      .select-field__input {
        @include row;
        align-items: center;
        justify-content: flex-start;
      }
    }
  }

  &__classes,
  &__generic-wrapper {
    padding: 8px;
  }

  &__classes,
  &__generic-wrapper,
  &__generic {
    border-bottom: 1px solid $colorBorderLight;
  }

  &__classes {
    height: auto;
  }

  &__statuses-wrapper {
    padding: 8px;
  }

  &__statuses {
    @include scrollbarV2;

    // STATUSED STYLE OVERRIDE
    &:deep(.workflow-filter__stage-template) {
      margin-bottom: 8px;

      .filter__title {
        @include typography(md-1, inter, 500);
        color: $colorContentSecondary;
        margin-bottom: 4px;
      }

      .filter__option {
        position: relative;
        @include row--center;
      }
    }

    &:deep(.status-filter) {
      .filter-item {
        @include row;
        justify-content: start;
        align-items: center;
        padding: 4px;
        margin-bottom: 4px;
        border: none;

        &__label {
          @include row;
          flex: 0 0;
          margin-right: 8px;
        }

        &__count {
          padding: 1px 5px;
          background-color: $colorSurfaceDarken;
          border-radius: 4px;
        }
      }
    }
  }

  &__classes,
  &__statuses {
    @include scrollbarV2;
  }

  .popup-menu {
    display: none;
    position: absolute;
    width: 244px;
    background-color: $colorWhite;
    z-index: 2;

    &--open {
      display: block;
    }

    &__header,
    &__footer {
      @include col;
      gap: 4px;
      width: 100%;
      height: auto;
      padding: 8px;
      z-index: 2;
    }

    &__header {
      border-bottom: 1px solid $colorBorderLight;
    }

    &__footer {
      border-top: 1px solid $colorBorderLight;
    }

    &__content {
      width: 100%;
      max-width: 100%;
      z-index: 1;
    }
  }
}
</style>
