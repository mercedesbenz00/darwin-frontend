<template>
  <div
    v-tooltip="tooltip"
    class="workflow-filter"
    tabindex="0"
  >
    <custom-button
      class="workflow-filter__button"
      size="large"
      color="secondary"
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
      @click:outside="onClickOutside"
    >
      <div class="popup-menu__header">
        <folder-structure
          class="workflow-filter__folder-structure"
          :dataset="dataset"
        />
        <v2-sort-control
          class="workflow-filter__sort"
          :sort-by="activeSortBy"
          :sort-direction="activeSortDirection"
          @change="onSortUpdated"
        />
      </div>
      <div class="popup-menu__content">
        <class-filter
          class="workflow-filter__classes"
          :dataset="dataset"
          :positive-class-ids="editingFilter.annotation_class_ids"
          :negative-class-ids="editingFilter.not_annotation_class_ids"
          :disabled="selectedItemIds.length === 0"
          @change="setClassFilter"
          list-only
        />

        <div class="workflow-filter__generic-wrapper">
          <generic-filter
            v-if="adminMode"
            class="workflow-filter__generic"
            :dataset="dataset"
            :positive-assignees="editingFilter.assignees"
            :negative-assignees="editingFilter.not_assignees"
            :positive-filenames="editingFilter.item_names"
            :negative-filenames="editingFilter.not_item_names"
            :positive-paths="editingFilter.item_paths"
            :negative-paths="editingFilter.not_item_paths"
            @change="setGenericFilter"
          />
        </div>
        <div class="workflow-filter__statuses-wrapper">
          <div class="workflow-filter__statuses">
            <stage-filter
              v-if="adminMode"
              class="workflow-filter__stage"
              :dataset="dataset"
              :workflow="workflow20"
              :included-ids="editingFilter.workflow_stage_ids"
              :excluded-ids="editingFilter.not_workflow_stage_ids"
              @change="setStageFilter"
            />
            <status-filter
              class="workflow-filter__status"
              :options="STATUS_FILTER_OPTIONS"
              :positive-options="editingFilter.statuses"
              :negative-options="editingFilter.not_statuses"
              :counts="counts"
              @change="setStatusFilter"
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
import {
  defineComponent,
  computed,
  ref,
  Ref,
  ComputedRef,
  watch
} from 'vue'

import { IconDuotoneSum } from '@/assets/icons/V2/Duotone'
import { IconMonoFilter, IconMonoChevron } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import PopupMenu from '@/components/Common/PopupMenu/V2/PopupMenu.vue'
import { StageFilter, StageFilterChange } from '@/components/DatasetFiltering/StageFilter/V2'
import StatusFilter from '@/components/DatasetFiltering/StatusFilter/V2/StatusFilter.vue'
import V2SortControl from '@/components/DatasetFiltering/V2SortControl.vue'
import { SortOptions } from '@/components/DatasetFiltering/types'
import ClassFilter from '@/components/DatasetManagement/Sidebar/V2ClassFilter.vue'
import GenericFilter from '@/components/DatasetManagement/Sidebar/V2GenericFilter.vue'
import {
  ClassFilterChange,
  GenericFilterChange,
  StatusFilterChange
} from '@/components/DatasetManagement/Sidebar/types'
import FolderStructure from '@/components/WorkView/WorkflowFilter/components/FolderStructure/V2/FolderStructure.vue'
import { useAuth, useStore } from '@/composables'
import { useRoute, useRouter } from '@/composables/useRouter'
import {
  DatasetItemCountsPayload,
  DatasetItemStatus,
  DatasetPayload, V2DatasetItemFilter,
  V2WorkflowPayload
} from '@/store/types'
import {
  getDatasetDefaultSortOptions,
  getRouteQueryFromV2DatasetItemFilter
} from '@/utils'

/**
 * Implements the filter UI element in the bottom left of the workview.
 *
 * Intended to share as much code with the sidebar filters on the data tab as possible,
 * so this is the direction further modification of this component should go in.
 */
export default defineComponent({
  name: 'WorkflowFilter',
  components: {
    ClassFilter,
    CustomButton,
    FolderStructure,
    GenericFilter,
    IconDuotoneSum,
    IconMonoChevron,
    IconMonoFilter,
    PopupMenu,
    V2SortControl,
    StageFilter,
    StatusFilter
  },
  props: {
    dataset: {
      required: true,
      type: Object as () => DatasetPayload
    }
  },
  setup (props, { emit }) {
    const { state, getters } = useStore()
    const { isAuthorized } = useAuth()
    const route = useRoute()
    const router = useRouter()

    const selectedItemIds = computed(() => state.dataset.selectedV2ItemIds)

    const editingFilter: Ref<V2DatasetItemFilter> = ref({})

    const counts: Ref<DatasetItemCountsPayload | null> = computed(() => {
      const { datasetDetails } = state.dataset
      return datasetDetails.find(d => d.id === props.dataset.id) || null
    })

    const datasetItemFilter = computed(() => {
      return state.dataset.datasetItemFilterV2
    })

    watch(datasetItemFilter, () => {
      editingFilter.value = {
        ...datasetItemFilter.value
      }
    }, { immediate: true })

    // WF2.0
    const getWorkflowByDatasetId: ComputedRef<(id: number) => V2WorkflowPayload | null> =
      computed(() => getters['v2Workflow/getWorkflowByDatasetId'])

    const open = ref(false)

    // Determines how the component will be rendered (full vs status filter only)
    // as well as which counts are fetched from backend.
    const adminMode = computed(() => isAuthorized('view_full_datasets'))

    const selectedStatuses = computed(() => datasetItemFilter.value.statuses || [])

    // WF2.0
    const workflow20 = computed(() =>
      props.dataset && getWorkflowByDatasetId.value(props.dataset.id)
    )

    // Filtering management
    const totalFilters = computed(() => counts.value?.item_count || 0)

    const activeFilters = computed(() => {
      return Object.entries(editingFilter.value)
        .reduce((acc, [key, value]) => {
          if (key === 'sort') { return acc }
          if (key === 'types') { return acc }
          if (key === 'has_comments') {
            if (value) { acc += 1 }
            return acc
          }
          if (typeof value === 'boolean') { acc += 1 }
          if (Array.isArray(value)) { acc += value.length }
          return acc
        }, 0)
    })

    const filteredLabel = computed(() => {
      const count: number = activeFilters.value
      return !totalFilters.value || count === 0
        ? 'All'
        : `${count} Filter${count > 1 ? 's' : ''}`
    })

    const tooltip = computed(() => {
      const total = totalFilters.value
      return {
        placement: 'top',
        content: total === 0
          ? 'No filters available'
          : `Filter images (${total} available)`,
        classes: 'tooltip--status',
        delay: { show: 300, hide: 300 }
      }
    })

    const defaultSortOptions = computed(() => {
      const sortOptions = getDatasetDefaultSortOptions(props.dataset)
      if (!sortOptions) {
        throw new Error(`Cannot find default sort options from the dataset ${props.dataset.id}`)
      }
      return sortOptions
    })

    const activeSortBy = computed(() => {
      const { sort } = editingFilter.value
      const { sortBy: defaultSortBy } = defaultSortOptions.value
      if (!sort) { return defaultSortBy }
      return Object.keys(sort)[0] || defaultSortBy
    })

    const activeSortDirection = computed(() => {
      const { sort } = editingFilter.value
      const { sortDirection: defaultSortDirection } = defaultSortOptions.value
      if (!sort) { return defaultSortDirection as 'asc' | 'desc' }
      return Object.values(sort)[0] || defaultSortDirection
    })

    const onOpen = (): void => {
      setTimeout(() => {
        emit(open.value ? 'close' : 'open')
        open.value = !open.value
      }, 100)
    }

    const onClose = (): void => {
      setTimeout(() => {
        emit('close')
        open.value = false
      }, 100)
    }

    const onClickOutside = (): void => {
      if (!open.value) { return }
      onClose()
    }

    const updateRouteQuery = (): void => {
      const query = getRouteQueryFromV2DatasetItemFilter(
        route.query,
        editingFilter.value
      )
      router.replace({ query }).catch((e: Error) => {
        // if we are pushing to the exact same route, the router will throw an
        // error. this silences that one specific error, but rethrows all the others
        if (e.name !== 'NavigationDuplicated') { throw e }
      })
    }

    const setGenericFilter = (newFilter: GenericFilterChange): void => {
      editingFilter.value = {
        ...editingFilter.value,
        assignees: newFilter.positiveAssignees,
        not_assignees: newFilter.negativeAssignees,
        item_names: newFilter.positiveFilenames,
        not_item_names: newFilter.negativeFilenames,
        item_paths: newFilter.positivePaths,
        not_item_paths: newFilter.negativePaths
      }
      updateRouteQuery()
    }

    const setStageFilter = (newFilter: StageFilterChange): void => {
      editingFilter.value = {
        ...editingFilter.value,
        workflow_stage_ids: newFilter.includedIds,
        not_workflow_stage_ids: newFilter.excludedIds
      }
      updateRouteQuery()
    }

    const setStatusFilter = (newFilter: StatusFilterChange): void => {
      editingFilter.value = {
        ...editingFilter.value,
        statuses: newFilter.positiveOptions,
        not_statuses: newFilter.negativeOptions
      }
      updateRouteQuery()
    }

    const setClassFilter = (newFilter: ClassFilterChange): void => {
      editingFilter.value = {
        ...editingFilter.value,
        annotation_class_ids: newFilter.positiveOptions,
        not_annotation_class_ids: newFilter.negativeOptions
      }
      updateRouteQuery()
    }

    const deselectAll = (): void => {
      editingFilter.value.annotation_class_ids = []
      editingFilter.value.not_annotation_class_ids = []
      editingFilter.value.assignees = []
      editingFilter.value.not_assignees = []
      editingFilter.value.item_names = []
      editingFilter.value.not_item_names = []
      editingFilter.value.has_comments = false
      editingFilter.value.item_paths = []
      editingFilter.value.not_item_paths = []
      editingFilter.value.statuses = []
      editingFilter.value.not_statuses = []
      editingFilter.value.workflow_stage_ids = []
      editingFilter.value.not_workflow_stage_ids = []
      updateRouteQuery()
    }

    // When sort options changes
    const onSortUpdated = (params: Pick<SortOptions, 'sortBy' | 'sortDirection'>): void => {
      const { sortBy, sortDirection } = params
      editingFilter.value.sort = { [sortBy]: sortDirection }
      updateRouteQuery()
    }

    const STATUS_FILTER_OPTIONS = [
      DatasetItemStatus.complete,
      DatasetItemStatus.new,
      DatasetItemStatus.annotate,
      DatasetItemStatus.review,
    ]

    return {
      counts,
      selectedItemIds,
      open,
      editingFilter,
      adminMode,
      selectedStatuses,
      workflow20,
      filteredLabel,
      totalFilters,
      activeFilters,
      tooltip,
      activeSortBy,
      activeSortDirection,
      deselectAll,
      onOpen,
      onSortUpdated,
      onClickOutside,
      setClassFilter,
      setGenericFilter,
      setStatusFilter,
      setStageFilter,
      STATUS_FILTER_OPTIONS
    }
  }
})
</script>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-workflow-filters .menu__wrapper {
  @include col;
  padding: 0;
}
</style>

<!-- eslint-disable-next-line vue-scoped-css/enforce-style-type -->
<style lang="scss">
.popup-menu-workflow-filters .menu__wrapper {
  @include col;
  padding: 0;
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

      :deep(path) {
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
    max-height: 480px;
    @include scrollbarV2;
  }

  .popup-menu {
    display: none;
    position: absolute;
    bottom: calc(#{$height} + 4px);
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
