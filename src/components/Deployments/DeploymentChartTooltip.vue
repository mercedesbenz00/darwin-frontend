<template>
  <div
    class="chart-tooltip"
    :style="style"
  >
    <div class="chart-tooltip__content">
      <div class="chart-tooltip__content__date">
        {{ date }}
      </div>
      <div class="chart-tooltip__content__values">
        <div
          v-for="([key, value], index) in Object.entries(values)"
          :key="`val-${index}`"
          class="chart-tooltip__content__values__value"
        >
          <span :style="valueStyle(key)">{{ formatKey(key) }}: {{ value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ChartTooltipModel } from 'chart.js'
import { Component, Vue, Prop } from 'vue-property-decorator'

import { rgbaString, RGBA } from '@/utils'

import { InstanceCountDimension } from './types'

type ValidValue = InstanceCountDimension | 'successfulRequests' | 'failedRequests'

const KEY_LABELS: Record<ValidValue, string> = {
  activeCount: 'Active',
  inactiveCount: 'Stopped',
  successfulRequests: 'Successful',
  failedRequests: 'Failed'
}

const KEY_COLORS: Record<ValidValue, RGBA> = {
  activeCount: { r: 87, g: 168, b: 241, a: 1.0 },
  inactiveCount: { r: 0, g: 217, b: 201, a: 1.0 },
  successfulRequests: { r: 0, g: 217, b: 201, a: 1.0 },
  failedRequests: { r: 222, g: 122, b: 122, a: 1.0 }
}

@Component({ name: 'deployment-chart-tooltip' })
export default class DeploymentChartTooltip extends Vue {
  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  values!: Object[]

  @Prop({ required: true })
  model!: ChartTooltipModel

  get left () {
    if (!this.model) { return null }
    return this.model.x
  }

  get top () {
    if (!this.model) { return null }
    return this.model.y
  }

  get style () {
    return {
      left: `${this.left}px`,
      top: `${this.top}px`
    }
  }

  valueStyle (key: ValidValue) {
    return { color: this.colorKey(key) }
  }

  colorKey (key: ValidValue): string {
    return rgbaString(KEY_COLORS[key])
  }

  formatKey (key: ValidValue): string {
    return KEY_LABELS[key] || ''
  }
}
</script>

<style lang="scss" scoped>
.chart-tooltip {
  opacity: 0.8;
  pointer-events: none;
  background: $colorSecondaryLight3;
  border-radius: 3px;
  padding: 5px;
  position: absolute;
  z-index: 2;
}

.chart-tooltip__content {
  @include typography(lg, headers, bold);
  align-items: center;
  padding: 5px;
}

.chart-tooltip__content__date {
  color: $colorSecondaryLight;
}
</style>
