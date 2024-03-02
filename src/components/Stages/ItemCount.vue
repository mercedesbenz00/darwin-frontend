<script lang="ts">
import { computed, defineComponent } from 'vue'

import RingLoader from '@/components/Common/LoadingIndicators/PlainLoaders/RingLoader/RingLoader.vue'
import { useItemCountsStore } from '@/composables/useItemCountsStore'
import { TooltipOptions } from '@/types'
import { formatNumericValueTersly } from '@/utils/formatter'
export default defineComponent({
  name: 'ItemCount',
  components: { RingLoader },
  props: {
    /**
     * Id of the stage we're showing the counts for
     *
     * Counts will be fetched from the counts store by this id
     */
    stageId: { type: String, required: true }
  },
  setup (props) {
    const countsStore = useItemCountsStore()

    /**
     * Exact item matched for the stage id, from within the counts store
     */
    const count = computed(() => {
      if (countsStore.stageCounts.status !== 'fetched') { return 'loading' }
      if (!countsStore.stageCounts.data) { return 'loading' }

      const forStage =
        countsStore.stageCounts.data.simple_counts.find(c => c.stage_id === props.stageId)

      const count = forStage ? forStage.item_count : 0

      return formatNumericValueTersly(count)
    })

    const tooltip = computed((): TooltipOptions | undefined => {
      return {
        placement: 'top',
        content: 'The number of files currently in this stage',
        trigger: 'hover',
        delay: {
          show: 300,
          hide: 300
        }
      }
    })

    return { count, tooltip }
  }
})
</script>

<template>
  <div class="item-count">
    <RingLoader v-if="count === 'loading'" />
    <span
      v-else
      v-tooltip="tooltip"
    >{{ count }}</span>
  </div>
</template>

<style lang="scss" scoped>
@import "@/uiKit/assets/index.scss";

.item-count {
  height: 20px;

  padding: 0 $spacing-4;
  border-radius: $borderRadius100;

  color: $colorContentDefault;
  background: $colorSurfaceRaise;

  @include autoLayout;
  @include fontRegularBody100;
}
</style>
