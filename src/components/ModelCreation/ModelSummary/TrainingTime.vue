<template>
  <div
    v-if="hoursEstimateFormatted"
    class="time"
  >
    <div class="time__label">
      Training Time
    </div>
    <div class="time__value">
      Up to
      <span class="time__value__amount">{{ hoursEstimateFormatted }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { RootState } from '@/store/types'
import { estimateTrainingHours } from '@/utils'

@Component({ name: 'training-time' })
export default class TrainingTime extends Vue {
  @State((state: RootState) => state.neuralModel.newModelTrainingCounts)
  imageCount!: number | null

  // hours

  get hoursEstimate (): number {
    const { imageCount } = this
    return estimateTrainingHours(imageCount || 0)
  }

  get hoursEstimateFormatted (): string {
    const { hoursEstimate } = this
    const rounded = Math.round(hoursEstimate)
    return rounded === 1
      ? `${rounded} hour`
      : `${rounded} hours`
  }
}
</script>

<style lang="scss" scoped>

.time {
  display: grid;
  grid-template-rows: auto auto;

  @include typography(md-1, Mulish);
  color: $colorAliceNight;

  justify-content: end;
  justify-items: end;

  .time__value {
    padding: 10px 0;

    .time__value__amount {
      font-weight: bold;;
      font-size: 18px;
      color: $colorBlack;
    }
  }
}
</style>
