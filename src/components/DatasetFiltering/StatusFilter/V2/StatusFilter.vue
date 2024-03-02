<template>
  <div class="status-filter">
    <div
      class="status-filter__wrapper"
      :class="{ 'status-filter__wrapper--more': hiddenOptions.length > 0 }"
    >
      <filter-list-element
        status="none"
        :meta="{ id: 'all', label: 'All', count: totalCounts }"
        @change="setAll"
      >
        <template #prefixIcon>
          <icon-all />
        </template>
      </filter-list-element>
      <filter-list-element
        v-for="option in visibleOptionsWithValue"
        :key="option.id"
        :status="option.value"
        :meta="option"
        @change="setOption(option.id, $event)"
      >
        <template #prefixIcon>
          <component :is="`icon-${option.id}`" />
        </template>
      </filter-list-element>
      <template v-if="hiddenOptionsWithValue.length > 0 && everythingVisible">
        <filter-list-element
          v-for="option in hiddenOptionsWithValue"
          :key="option.id"
          :status="option.value"
          :meta="option"
          @change="setOption(option.id, $event)"
        >
          <template #prefixIcon>
            <component :is="`icon-${option.id}`" />
          </template>
        </filter-list-element>
      </template>
      <custom-button
        v-if="hiddenOptionsWithValue.length > 0"
        variant="default"
        size="small"
        color="secondary"
        flair="rounded"
        tag="button"
        full-width
        @click="toggleHiddenOptions"
      >
        {{ everythingVisible ? 'Hide' : 'Show' }}
      </custom-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import {
  IconColoredAnnotate as IconAnnotate,
  IconColoredComplete as IconComplete,
  IconColoredDataset as IconDataset,
  IconColoredReview as IconReview,
  IconColoredWebhook as IconWebhook
} from '@/assets/icons/V2/Colored'
import {
  IconDuotoneComment as IconCommented,
  IconDuotoneSearch,
  IconDuotoneStatusSum as IconAll,
  IconDuotoneWarn as IconError,
  IconDuotoneUpload as IconUploading,
  IconDuotoneTrash as IconArchived,
  IconDuotoneProcessing as IconProcessing
} from '@/assets/icons/V2/Duotone'
import { IconMonoIdle as IconNew } from '@/assets/icons/V2/Mono'
import { CustomButton } from '@/components/Common/Button/V2'
import FilterListElement from '@/components/Common/ListElements/FilterListElement/FilterListElement.vue'
import { StatusFilterItemTypeV2 } from '@/components/DatasetFiltering/types'
import { DatasetItemStatus, getDatasetItemStatusLabel } from '@/store/types'
import { DatasetItemCountsPayload } from '@/store/types/DatasetItemCountsPayload'
import { TriToggleStatusV2 } from '@/utils'

const statusToTriToggle = (
  id: DatasetItemStatus, 
  positive: DatasetItemStatus[], 
  negative: DatasetItemStatus[]
): TriToggleStatusV2 => 
  positive.includes(id) 
    ? TriToggleStatusV2.POSITIVE
    : negative.includes(id) 
      ? TriToggleStatusV2.NEGATIVE 
      : TriToggleStatusV2.NONE

const getCount = (id: DatasetItemStatus, count: DatasetItemCountsPayload | null): number | null => {
  const countMatch = count?.status_counts.find(s => s.status === id)
  return !!countMatch ? countMatch.count : null
}
  
type OptionWithValue = StatusFilterItemTypeV2 & { value: TriToggleStatusV2 }

/**
 * @Component StatusFilter
 * ~ Any description
 * @param {string} prop
 * */

export default defineComponent({
  name: 'StatusFilter',
  components: {
    CustomButton,
    FilterListElement,
    IconDuotoneSearch,
    IconDataset,
    IconComplete,
    IconReview,
    IconWebhook,
    IconAnnotate,
    IconAll,
    IconCommented,
    IconUploading,
    IconArchived,
    IconError,
    IconNew,
    IconProcessing
  },
  props: {
    /** Options that are visible above the fold */
    options: {
      type: Array as () => DatasetItemStatus[],
      required: true
    },
    /**
     * Options that are hidden below the fold, behind the show more button.
     * If not specified, the fold will not render
     */
    hiddenOptions: {
      type: Array as () => DatasetItemStatus[],
      required: false,
      default: () => []
    },
    /**
     * Payload containing counts information for all the statuses. If not given
     * counts will not be rendered.
     */
    counts: {
      type: Object as () => DatasetItemCountsPayload | null,
      required: false,
      default: null
    },
    /**
     * Current positively selected options
     */
    positiveOptions: {
      type: Array as () => DatasetItemStatus[],
      required: false,
      default: () => []
    },
    /**
     * Current negatively selected options
     */
    negativeOptions: {
      type: Array as () => DatasetItemStatus[],
      required: false,
      default: () => []
    }
  },
  setup (props, { emit }) {
    const everythingVisible = ref<boolean>(false)

    const visibleOptionsWithValue = computed<OptionWithValue[]>(() => 
      props.options.map(id => { 
        const value = statusToTriToggle(id, props.positiveOptions, props.negativeOptions)
        const count = getCount(id, props.counts)
        const label = getDatasetItemStatusLabel(id)
        const icon = `icon-${id}`
        return { id, label, icon, value, count }
      })
    )

    const hiddenOptionsWithValue = computed<OptionWithValue[]>(() => 
      props.hiddenOptions.map(id => { 
        const value = statusToTriToggle(id, props.positiveOptions, props.negativeOptions)
        const count = getCount(id, props.counts)
        const label = getDatasetItemStatusLabel(id)
        const icon = `icon-${id}`
        return { id, label, icon, value, count }
      })
    )

    const totalCounts = computed(() => props.counts ? props.counts.item_count : 0)

    /** 
     * User has toggled the "show more / hide button" 
     * 
     * Other than "persisting" the toggle, we also emit a change so the 
     * now hidden options are no longer part of the filter
     */
    const toggleHiddenOptions = (): void => {
      everythingVisible.value = !everythingVisible.value
      
      emit('change', {
        positiveOptions: props.options.filter(o => props.positiveOptions.includes(o)),
        negativeOptions: props.options.filter(o => props.negativeOptions.includes(o)),
      })
    }

    /**
     * User has toggled the "All" option.
     * 
     * We have to emit an event as if all the visible options have been set to 
     * the new value.
     */
    const setAll = (status: TriToggleStatusV2): void => {
      // the options we emit in case of positive/negative are only the visible
      // ones
      const allOptions = everythingVisible.value 
        ? [...props.options, props.hiddenOptions]
        : [...props.options]
      
      if (status === TriToggleStatusV2.POSITIVE) {
        emit('change', { positiveOptions: allOptions, negativeOptions: [] })
        return 
      }

      if (status === TriToggleStatusV2.NEGATIVE) {
        emit('change', { positiveOptions: [], negativeOptions: allOptions })  
      }

      emit('change', { positiveOptions: [], negativeOptions: [] })  
    }

    /**
     * User has toggled a single option
     * Put that option into the correct place and emit
     */
    const setOption = (id: DatasetItemStatus, status: TriToggleStatusV2): void => {
      const positiveOptions = props.positiveOptions.filter(o => o !== id)
      const negativeOptions = props.negativeOptions.filter(o => o !== id)
      
      if (status === TriToggleStatusV2.POSITIVE) {
        positiveOptions.push(id)
      } 

      if (status === TriToggleStatusV2.NEGATIVE) {
        negativeOptions.push(id)
      }

      emit('change', {
        positiveOptions,
        negativeOptions
      }) 
    }

    return {
      everythingVisible,
      visibleOptionsWithValue,
      hiddenOptionsWithValue,
      toggleHiddenOptions,
      setAll,
      setOption,
      totalCounts
    }
  }
})
</script>

<style lang="scss" scoped>
.status-filter__wrapper {
  display: flex;
  flex-direction: column;

  &--more {
    padding-bottom: 8px;
  }

  & > * {
    &:not(:last-child) {
      margin-bottom: 2px;
    }
  }
}
</style>
