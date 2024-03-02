<template>
  <sidebar :hide-notch="true">
    <div class="data-sidebar__content">
      <generic-filter
        class="data-sidebar__generic"
        :dataset="dataset"
        :positive-assignees="editingFilter.assignees"
        :negative-assignees="editingFilter.not_assignees"
        :positive-filenames="editingFilter.item_names"
        :negative-filenames="editingFilter.not_item_names"
        :positive-paths="editingFilter.item_paths"
        :negative-paths="editingFilter.not_item_paths"
        @change="setGenericFilter"
      />
      <stage-filter
        :dataset="dataset"
        :included-ids="editingFilter.workflow_stage_ids"
        :excluded-ids="editingFilter.not_workflow_stage_ids"
        :workflow="workflow"
        @change="setStageFilter"
        v-if="workflow"
      >
        <template #workflow-routing>
          <div
            class="filter__routing"
          >
            <router-link
              class="filter__routing--link"
              :to="workflowRoute"
            >
              <icon-mono-connect />
              <span class="filter__routing--name">
                {{ workflow.name }}
              </span>
              <icon-mono-arrow-up
                class="filter__routing--icon"
              />
            </router-link>
          </div>
        </template>
      </stage-filter>
      <status-filter
        v-if="counts"
        class="data-sidebar__status"
        :dataset="currentDataset"
        :options="STATUS_OPTIONS_ABOVE_FOLD"
        :hidden-options="STATUS_OPTIONS_BELOW_FOLD"
        :commented="editingFilter.has_comments"
        :positive-options="editingFilter.statuses"
        :negative-options="editingFilter.not_statuses"
        :counts="counts"
        @change="setStatusFilter"
      />
      <class-filter
        class="data-sidebar__tags"
        :dataset="dataset"
        :positive-options="editingFilter.annotation_class_ids"
        :negative-options="editingFilter.not_annotation_class_ids"
        :disabled="disabledTagAction"
        :disabled-action-tooltip="disabledTagActionTooltip"
        @change="setClassFilter"
      />
    </div>
  </sidebar>
</template>

<script lang="ts">

import {
  computed,
  defineComponent,
  ref,
  watch,
  PropType
} from 'vue'

import { IconMonoConnect, IconMonoArrowUp } from '@/assets/icons/V2/Mono'
import {StageFilter, StageFilterChange } from '@/components/DatasetFiltering/StageFilter/V2'
import StatusFilter from '@/components/DatasetFiltering/StatusFilter/V2/StatusFilter.vue'
import { useStore } from '@/composables'
import { useRoute, useRouter } from '@/composables/useRouter'
import {
  DatasetItemStatus,
  DatasetPayload,
  V2DatasetItemPayload,
  V2DatasetItemFilter
} from '@/store/types'
import { getRouteQueryFromV2DatasetItemFilter } from '@/utils'

import Sidebar from './Sidebar.vue'
import ClassFilter from './V2ClassFilter.vue'
import GenericFilter from './V2GenericFilter.vue'
import { ClassFilterChange, GenericFilterChange, StatusFilterChange } from './types'

export default defineComponent({
  name: 'V2WorkflowSidebar',
  components: {
    ClassFilter,
    GenericFilter,
    IconMonoArrowUp,
    IconMonoConnect,
    Sidebar,
    StageFilter,
    StatusFilter
  },
  props: {
    dataset: {
      required: true,
      type: Object as PropType<DatasetPayload>
    },
    datasetItems: {
      required: false,
      type: Array as PropType<V2DatasetItemPayload[]>,
      default: () => []
    }
  },
  setup (props) {
    const router = useRouter()
    const route = useRoute()
    const { state } = useStore()

    const editingFilter= ref<V2DatasetItemFilter>({})
    const currentDataset = computed(() => state.dataset.currentDataset)
    const datasetItemFilter = computed(() => state.dataset.datasetItemFilterV2)

    const counts = computed(() => {
      const { datasetDetails } = state.dataset
      return datasetDetails.find(d => d.id === props.dataset.id) || null
    })

    const statusCount = (status: DatasetItemStatus): number | null => {
      if (!counts.value) { return null }
      const result = counts.value.status_counts.find(c => c.status === status)
      return result ? result.count : null
    }

    const selectedItemIds = computed(() => state.dataset.selectedV2ItemIds)

    const disabledTagAction = computed<boolean>(() => {
      if (selectedItemIds.value.length === 0) {
        return true
      } else if (state.dataset.selectedAll) {
        return !!statusCount(DatasetItemStatus.processing)
      } else {
        return props.datasetItems.filter(
          item => selectedItemIds.value.includes(item.id) &&
            item.status === DatasetItemStatus.processing
        ).length > 0
      }
    })

    const disabledTagActionTooltip = computed(() => {
      if (disabledTagAction.value) {
        if (selectedItemIds.value.length > 0) {
          return "Can't tag uploading/processing items"
        }
      }
      return undefined
    })

    watch(datasetItemFilter, () => {
      editingFilter.value = { ...datasetItemFilter.value }
    }, { immediate: true })

    const workflow = computed(() => 
      state.v2Workflow.workflows.find(
        w => 
          w.stages.some(s => 'dataset_id' in s.config && s.config.dataset_id === props.dataset.id)
      ) || null
    )

    const workflowRoute = computed(() => {
      if (workflow.value) {
        return `/workflows/${workflow.value.id}`
      }
      
      return null
    })

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

    const STATUS_OPTIONS_ABOVE_FOLD = [
      DatasetItemStatus.complete,
      DatasetItemStatus.new,
      DatasetItemStatus.annotate,
      DatasetItemStatus.review
    ]

    const STATUS_OPTIONS_BELOW_FOLD = [
      DatasetItemStatus.processing,
      DatasetItemStatus.uploading,
      DatasetItemStatus.error,
      DatasetItemStatus.archived
    ]

    return {
      counts,
      currentDataset,
      disabledTagAction,
      disabledTagActionTooltip,
      editingFilter,
      selectedItemIds,
      workflow,
      workflowRoute,
      setClassFilter,
      setGenericFilter,
      setStageFilter,
      setStatusFilter,
      STATUS_OPTIONS_ABOVE_FOLD,
      STATUS_OPTIONS_BELOW_FOLD
    }
  }
})
</script>

<style lang="scss" scoped>
.data-sidebar__content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.data-sidebar__tags {
  margin-top: 4px;
  flex: 1;
}

.filter__routing {
  display: flex;
  position: relative;
  width: 100%;
  padding-right: 8px;
  margin-bottom: 8px;

  > :deep(a) {
    @include typography(md, inter, 500);
    color: $colorContentDefault;

    &:hover {
      color: $colorInteractivePrimaryDefault;
      padding-right: 5px;

      .filter__routing--icon {
        display: inline-block;
      }
    }
    display: flex;
    width: 100%;
    align-items: center;
    gap: 4px;

    svg {
      flex-shrink: 0;
    }
  }
}

.filter__routing--name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  display: inline-block;
}

.filter__routing--icon {
  display: none;
  position: absolute;
  right: 0px;
}
</style>
