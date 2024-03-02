<template>
  <div
    class="chart-tooltip"
    :style="style"
  >
    <h3 class="chart-tooltip__header">
      {{ date }}
    </h3>
    <div class="chart-tooltip__content">
      <div class="chart-tooltip__content__dimension">
        <img src="./assets/status_complete.svg">
        {{ approved }} Approved
      </div>
      <div class="chart-tooltip__content__dimension">
        <img src="./assets/status_rejected.svg">
        {{ rejected }} Rejected
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Chart from 'chart.js'
import { Component, Vue, Prop } from 'vue-property-decorator'

import TeamMemberAvatar from '@/components/Common/Avatar/V1/TeamMemberAvatar.vue'

@Component({ name: 'annotation-bar-chart-tooltip', components: { TeamMemberAvatar } })
export default class AnnotationBarChartTooltip extends Vue {
  @Prop({ required: true })
  approved!: number

  @Prop({ required: true })
  date!: string

  @Prop({ required: true })
  model!: Chart.ChartTooltipModel | null

  @Prop({ required: true })
  rejected!: number

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
}
</script>

<style lang="scss" scoped>
.chart-tooltip {
  pointer-events: none;
  background: $colorSecondaryLight2;
  border-radius: 10px;
  padding: 10px;
  position: absolute;
  box-shadow: 0px 4px 10px rgba(145, 169, 192, 0.4);
  z-index: 2;
}

.chart-tooltip__header {
  @include typography(lg, headers, bold);
  margin-bottom: 10px;
}

.chart-tooltip__content {
  @include col--left;
}

.chart-tooltip__content__dimension {
  @include row;
  align-items: center;
  @include typography(md-1, headlines, bold)
}

.chart-tooltip__content__dimension:not(:last-child) {
  margin-bottom: 10px;
}

.chart-tooltip__content__dimension > :first-child {
  margin-right: 10px;
}
</style>
