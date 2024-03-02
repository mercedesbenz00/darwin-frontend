<template>
  <div
    class="credit-usage__tick"
    :class="{
      'credit-usage__tick--hover': showTooltip
    }"
    v-tooltip="tooltipOptions"
    :style="{
      width: `${percentage}%`,
      'background-color': color
    }"
  >
    <template v-if="shouldShowValue">
      {{ tick.tick_cost }}
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

import { TickPayload } from '@/store/types'
import { TooltipOptions } from '@/types'

import { labelsMap, colorMap } from './tick-actions'

export default defineComponent({
  name: 'V2CreditBar',
  props: {
    tick: {
      required: true,
      type: Object as () => TickPayload
    },
    tickCount: {
      required: true,
      type: Number
    },
    showTooltip: Boolean
  },
  setup (props) {
    const percentage = computed((): number =>
      props.tickCount > 0 ? (props.tick.tick_cost / props.tickCount) * 100 : 0
    )
    const shouldShowValue = computed((): boolean => percentage.value > 3)
    const color = computed((): string => colorMap[props.tick.action])
    const label = computed((): string => labelsMap[props.tick.action])

    const tooltipOptions = computed((): TooltipOptions => ({
      content: `${props.tick.tick_cost} Credits used on ${label.value}`,
      delay: 0,
      show: props.showTooltip
    }))

    return {
      shouldShowValue,
      percentage,
      color,
      label,
      tooltipOptions
    }
  }
})
</script>

<style lang="scss" scoped>
.credit-usage__tick {
  @include row;
  @include ellipsis(1, md-1);
  @include typography(md-1, mulish, bold);
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
  overflow: hidden;
  user-select: none;
  will-change: filter;

  &--hover, &:hover {
    animation: pulse 1.5s linear infinite;
  }

  @keyframes pulse {
    0% {
      filter: brightness(1);
    }
    50% {
      filter: brightness(1.2);
    }
    100% {
      filter: brightness(1);
    }
  }
}
</style>
