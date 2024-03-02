<template>
  <div
    v-if="report"
    class="overview__progress-body"
  >
    <div class="overview__progress-chart">
      <progress-chart :percentages="percentages" />
      <div class="overview__progress-chart__text">
        <span>
          {{ progress }}
          <span class="overview__progress-chart__text-unit">%</span>
        </span>
        <span class="overview__progress-chart__text-description">Overall Progress</span>
      </div>
    </div>
    <div class="overview__progress-board">
      <div
        v-for="point in dataPoints"
        :key="point.label"
        class="overview__card__stats"
      >
        <div
          class="overview__card__stats__value"
          :class="{[`overview__progress--${point.icon}`]: !!point.icon}"
        >
          {{ point.value }}
        </div>
        <div class="overview__card__stats__name">
          {{ point.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import ProgressChart from '@/components/Dataset/ProgressChart.vue'
import { DatasetReportPayload, DatasetItemStatus } from '@/store/types'

@Component({
  name: 'overview',
  components: { ProgressChart }
})
export default class DatasetProgressSection extends Vue {
  @Prop({ required: true })
  report!: DatasetReportPayload

  get itemsOpenCount (): number {
    return this.itemsByStatus([
      DatasetItemStatus.uploading,
      DatasetItemStatus.processing,
      DatasetItemStatus.new
    ])
  }

  get itemsInProgressCount (): number {
    return this.itemsByStatus([
      DatasetItemStatus.annotate,
      DatasetItemStatus.review
    ])
  }

  get itemsCompletedCount (): number {
    return this.itemsByStatus([DatasetItemStatus.complete])
  }

  get itemCount (): number {
    const { report } = this
    return report.item_count
  }

  /**
   * We want this to return null if report is not available so that the donut
   * chart being rendered on this page is able to figure out if it should
   * render itself or not.
   */
  get percentages (): Array<number> | null {
    return [this.itemsOpenCount, this.itemsInProgressCount, this.itemsCompletedCount]
  }

  get progress (): number {
    if (!this.report) { return 0 }
    return Math.round((this.report.progress || 0) * 100)
  }

  itemsByStatus (statuses: DatasetItemStatus[]): number {
    const { report } = this
    if (!this.report) { return 0 }
    const datas = report.items_by_status
      .filter(i => statuses.includes(i.status)).map(i => i.count)

    return datas.reduce((total, curr) => total + curr, 0)
  }

  get dataPoints () {
    return [
      { label: 'Total Items', value: this.itemCount },
      { label: 'Open Items', value: this.itemsOpenCount, icon: 'open' },
      { label: 'Items in Progress', value: this.itemsInProgressCount, icon: 'in-progress' },
      { label: 'Active Annotators', value: this.report.annotator_count },
      { label: 'Completed Images', value: this.itemsCompletedCount, icon: 'completed' }
    ]
  }
}
</script>

<style lang="scss" scoped>
.overview__progress-body {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
}

.overview__progress-chart {
  position: relative;
  margin-left: 15px;
  margin-right: 15px;
  max-width: 150px;

  @include respondFrom(lg) {
    max-width: 200px;
    margin-right: 20px;
  }
  @include respondFrom(xl) {
    max-width: 250px;
    margin-right: 35px;
  }
  @include respondFrom(xxl) {
    max-width: 300px;
    margin-right: 35px;
  }
  @include respondFrom(xxxl) {
    max-width: 350px;
    margin-right: 35px;
  }
}

.overview__progress-chart__text {
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  left: 20px;
  @include col--center;
  @include typography(xxl-2, headlines, 500);
  letter-spacing: 2px;
  color: $colorSecondaryDark1;
}

.overview__progress-chart__text-unit {
  @include typography(xl-1);
  color: $colorSecondaryLight1;
}

.overview__progress-chart__text-description {
  @include typography(md, default);
  line-height: 18px;
  color: $colorSecondaryLight;
  text-align: center;
}

.overview__progress-board {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-items: left;
  justify-self: center;
}

@mixin dot($background) {
  padding-left: 20px;

  &::before {
    position: absolute;
    content: ' ';
    left: 0;
    top: 8px;
    width: 10px;
    height: 10px;
    border-radius: 10px;
    background: $background;
  }
}

.overview__progress--open {
  @include dot($colorSecondaryLight1);
}

.overview__progress--in-progress {
  @include dot($colorYellow);
}

.overview__progress--completed {
  @include dot($colorPrimaryLight);
}

.overview__card__stats {
  position: relative;
  margin-left: 15px;
  margin-right: 15px;
  margin-bottom: 20px;

  @include respondFrom(xl) {
    margin-left: 25px;
    margin-right: 25px;
  }
}

.overview__card__stats__value {
  @include typography(xl-1, headlines, 500);
  letter-spacing: 2px;
  color: $colorSecondaryDark1;
}
.overview__card__stats__name {
  display: block;
  width: 100%;
  @include typography(md, default);
  line-height: 18px;
  color: $colorSecondaryLight;
}
</style>
