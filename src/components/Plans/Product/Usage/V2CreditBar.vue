<template>
  <div>
    <div class="credit-usage-summary">
      <div class="credit-usage__progress">
        <credit-bar-tick
          v-for="tick of ticks"
          :key="tick.action"
          :show-tooltip="showTooltip[tick.action]"
          :tick-count="creditUsage.ticks_count"
          :tick="tick"
        />
      </div>
    </div>

    <div class="credit-usage__legend legend">
      <div
        v-for="tick of ticks"
        :key="`legend_${tick.action}`"
        class="legend__item"
        :style="{
          'color': getColor(tick.action)
        }"
        @mouseover="showRelatedTooltip(tick.action)"
        @mouseleave="hideRelatedTooltip(tick.action)"
      >
        <span
          class="legend__item-color"
          :style="{
            'background-color': getColor(tick.action)
          }"
        /> {{ getLabel(tick.action) }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'

import { CreditUsagePayloadV2, TickPayload } from '@/store/types'

import CreditBarTick from './CreditBarTick.vue'
import { labelsMap, colorMap } from './tick-actions'

export default defineComponent({
  name: 'V2CreditBar',
  components: { CreditBarTick },
  props: {
    creditUsage: {
      required: true,
      type: Object as () => CreditUsagePayloadV2
    }
  },
  setup (props) {
    const showTooltip = ref({
      labeling_stage: false,
      auto_annotate: false,
      model_tool: false,
      model_stage: false,
      export: false,
      consensus_stage: false,
      annotation_time: false,
      annotation: false,
      storage: false,
      api_call: false
    })

    const ticks = computed((): TickPayload[] => {
      return [...props.creditUsage.ticks]
        .filter(a => !!a.tick_cost)
        .sort((a, b) =>
          b.tick_cost - a.tick_cost
        )
    })

    const getColor = (action: TickPayload['action']): string => colorMap[action]
    const getLabel = (action: TickPayload['action']): string => labelsMap[action]
    const showRelatedTooltip = (action: TickPayload['action']): void => {
      showTooltip.value[action] = true
    }
    const hideRelatedTooltip = (action: TickPayload['action']): void => {
      showTooltip.value[action] = false
    }

    return {
      ticks,
      showTooltip,
      getColor,
      getLabel,
      showRelatedTooltip,
      hideRelatedTooltip
    }
  }
})
</script>

<style lang="scss" scoped>
.credit-usage-summary {
  width: 100%;
  height: 35px;
  position: relative;
  border-radius: 6px;
  background: $colorAliceNight;
  box-shadow: inset 0px 5px 10px rgba(88, 116, 141, 0.5);
  overflow: hidden;
}

.credit-usage__progress {
  position: absolute;
  @include fullsize;
  @include row;
  align-items: center;

  & > div {
    min-width: 5px;
  }
}

.legend {
  margin-top: 10px;

  &__item {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    margin-right: 10px;
    margin-bottom: 10px;
  }

  &__item-color {
    display: inline-block;
    width: 15px;
    height: 15px;
    border-radius: 3px;
    margin-right: 5px;
  }
}
</style>
