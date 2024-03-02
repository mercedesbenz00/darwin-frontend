<template>
  <status-filter
    show-all
    :all-count="statusAllCount"
    :options="filterStatusOptions"
    :options-to-hide="statusOptionsToHide"
    :commented="commented"
    :positive-options="positiveStatuses"
    :negative-options="negativeStatuses"
    @change="updateFilter"
  />
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  SetupContext
} from 'vue'

import StatusFilter from '@/components/DatasetFiltering/StatusFilter/V1/StatusFilter.vue'
import { StatusFilterItemType } from '@/components/DatasetFiltering/types'
import { useStore } from '@/composables'
import {
  DatasetItemStatus,
  DatasetItemCountsPayload,
  getDatasetItemStatusLabel
} from '@/store/types'

export default defineComponent({
  name: 'WorkflowSidebarStatusFilter',
  components: { StatusFilter },
  props: {
    positiveStatuses: {
      required: false,
      type: Array as PropType<(DatasetItemStatus | 'commented')[]>,
      default: () => []
    },
    negativeStatuses: {
      required: false,
      type: Array as PropType<DatasetItemStatus[]>,
      default: () => []
    },
    commented: { required: false, type: Boolean, default: false },
    isOpenMode: { required: false, type: Boolean, default: false }
  },
  setup (props, { emit }: SetupContext) {
    const { state } = useStore()

    const counts = computed((): DatasetItemCountsPayload | null => {
      const { currentDataset, datasetDetails } = state.dataset
      return datasetDetails.find(d => d.id === currentDataset.id) || null
    })

    const statusOptionsToHide = computed((): DatasetItemStatus[] => {
      if (props.isOpenMode) {
        return []
      } else {
        return [
          DatasetItemStatus.processing,
          DatasetItemStatus.uploading,
          DatasetItemStatus.error,
          DatasetItemStatus.archived
        ]
      }
    })

    const commentOption = computed((): StatusFilterItemType => {
      return {
        id: 'commented',
        label: 'Commented',
        icon: '/static/imgs/image-status/comment.svg',
        count: counts.value ? counts.value.commented_item_count : null,
        omitFromAllSelected: true
      }
    })

    const statusCount = (status: DatasetItemStatus): number | null => {
      if (!counts.value) { return null }
      const result = counts.value.status_counts
        .find(c => c.status === status)
      return result ? result.count : null
    }

    /**
     * Options listed in the dropdown
     *
     * Order is important here, so DO NOT sort them alphabetically
     */
    const filterStatusOptions = computed((): StatusFilterItemType[] => {
      const icons: { [id in DatasetItemStatus]: string } = {
        [DatasetItemStatus.complete]: '/static/imgs/image-status/completed.svg',
        [DatasetItemStatus.new]: '/static/imgs/image-status/new.svg',
        [DatasetItemStatus.annotate]: '/static/imgs/image-status/annotate.svg',
        // those two are just for compatibility, they should not happen in V1
        [DatasetItemStatus.consensus]: '',
        [DatasetItemStatus.logic]: '',
        [DatasetItemStatus.review]: '/static/imgs/image-status/review.svg',
        [DatasetItemStatus.processing]: '/static/imgs/image-status/processing.svg',
        [DatasetItemStatus.uploading]: '/static/imgs/image-status/uploading.svg',
        [DatasetItemStatus.error]: '/static/imgs/image-status/error.svg',
        [DatasetItemStatus.archived]: '/static/imgs/image-status/archived.svg',
        [DatasetItemStatus.webhook]: '/static/imgs/image-status/webhook.svg',
        [DatasetItemStatus.code]: '' // not used, just to satisfy types
      }

      let itemsStatus = []
      if (props.isOpenMode) {
        itemsStatus = [
          DatasetItemStatus.complete,
          DatasetItemStatus.new,
          DatasetItemStatus.annotate,
          DatasetItemStatus.review
        ]
      } else {
        itemsStatus = [
          DatasetItemStatus.complete,
          DatasetItemStatus.new,
          DatasetItemStatus.annotate,
          DatasetItemStatus.review,
          DatasetItemStatus.processing,
          DatasetItemStatus.uploading,
          DatasetItemStatus.error,
          DatasetItemStatus.archived
        ]
      }

      const options: StatusFilterItemType[] = itemsStatus
        .map(key => ({
          id: key,
          label: getDatasetItemStatusLabel(key),
          icon: icons[key],
          count: statusCount(key),
          omitFromAllSelected: false
        }))

      options.splice(4, 0, commentOption.value)
      return options
    })

    const statusAllCount = computed((): number => {
      return counts.value ? counts.value.item_count : 0
    })

    const updateFilter = (evt: {
      positiveOptions: (DatasetItemStatus | 'commented')[],
      negativeOptions: DatasetItemStatus[]
    }): void => {
      const positiveStatuses = evt.positiveOptions
        .filter(status => status !== 'commented')
      const commented = evt.positiveOptions.includes('commented')
      emit('update:positive-statuses', positiveStatuses)
      emit('update:negative-statuses', evt.negativeOptions)
      emit('update:commented', commented)
      emit('change', evt)
    }

    return {
      counts,
      statusOptionsToHide,
      commentOption,
      statusCount,
      filterStatusOptions,
      statusAllCount,
      updateFilter
    }
    
  }
})
</script>
