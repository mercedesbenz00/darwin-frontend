<template>
  <div
    class="chart-tooltip"
    :style="style"
  >
    <h3 class="chart-tooltip__header">
      {{ title }}
    </h3>
    <div
      v-for="{ member, value } in data"
      :key="member ? member.id: 'total'"
      class="chart-tooltip__content"
    >
      <team-member-avatar
        v-if="member"
        class="chart-tooltip__content__icon"
        :member="member"
      />
      <sigma-icon
        v-else
        class="chart-tooltip__content__icon"
      />
      <div>{{ value }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import Chart from 'chart.js'
import { Component, Vue, Prop } from 'vue-property-decorator'

import SigmaIcon from '@/components/Annotators/AnnotationMetrics/Common/SigmaIcon.vue'
import { ChartTooltipData } from '@/components/Annotators/AnnotationMetrics/types'
import TeamMemberAvatar from '@/components/Common/Avatar/V1/ResponsiveTeamMemberAvatar.vue'

@Component({ name: 'annotation-chart-tooltip', components: { SigmaIcon, TeamMemberAvatar } })
export default class AnnotationChartTooltip extends Vue {
  @Prop({ required: true, type: Array })
  data!: ChartTooltipData[]

  @Prop({ required: true })
  title!: string | null

  @Prop({ required: true })
  model!: Chart.ChartTooltipModel | null

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
  background: $colorSecondaryLight3;
  border-radius: 10px;
  padding: 10px;
  position: absolute;
  box-shadow: 0px 0px 4px $colorPrimaryLight3, 0px 4px 4px rgba(145, 169, 192, 0.3);
  z-index: 2;
}

.chart-tooltip__header {
  @include typography(lg, headers, bold);
  margin-bottom: 10px;
}

.chart-tooltip__content {
  @include row;
  align-items: center;
}

.chart-tooltip__content:not(:last-child) {
  margin-bottom: 10px;
}

.chart-tooltip__content__icon {
  margin-right: 10px;
  height: 35px;
  width: 35px;
}

.chart-tooltip__content__icon--sigma img {
  height: 15px;
  width: 15px;
}

</style>
