<template>
  <spaced-donut-chart
    :data="donutChartData"
    :text="progress"
    subtext="Overall Progress"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Getter } from 'vuex-class'

import SpacedDonutChart from '@/components/Dashboard/SpacedDonutChart.vue'
import {
  DatasetItemStatus,
  DatasetPayload,
  DatasetReportPayload
} from '@/store/types'

@Component({ name: 'progress-donut-chart', components: { SpacedDonutChart } })
export default class ProgressDonutChart extends Vue {
  // dataset data

  @Prop({ required: true, type: Object as () => DatasetPayload })
  dataset!: DatasetPayload

  @Getter('reportByDatasetId', { namespace: 'annotators' })
  reportByDatasetId!: (id: number) => DatasetReportPayload | null

  get report (): DatasetReportPayload | null {
    return this.reportByDatasetId(this.dataset.id)
  }

  byStatus (statuses: DatasetItemStatus[]): number {
    const { report } = this
    if (!report) { return 0 }
    const counts = report.items_by_status
      .filter(item => statuses.includes(item.status)).map(i => i.count)
    return counts.reduce((total, curr) => total + curr, 0)
  }

  get newCount (): number {
    const { report } = this
    if (!report) { return 0 }

    return this.byStatus([
      DatasetItemStatus.uploading,
      DatasetItemStatus.processing,
      DatasetItemStatus.new
    ])
  }

  get inProgressCount (): number {
    const { report } = this
    if (!report) { return 0 }

    return this.byStatus([
      DatasetItemStatus.annotate,
      DatasetItemStatus.review
    ])
  }

  get completedCount (): number {
    const { report } = this
    if (!report) { return 0 }

    return this.byStatus([DatasetItemStatus.complete])
  }

  get totalCount (): number {
    return this.newCount + this.inProgressCount + this.completedCount
  }

  get stats () {
    const { completedCount, inProgressCount, newCount, totalCount } = this
    return { completedCount, inProgressCount, newCount, totalCount }
  }

  get progress () {
    const { stats, report } = this
    if (report === null) { return 'N/A' }
    if (stats.totalCount === 0) { return '0%' }
    const progress = stats.completedCount / stats.totalCount
    return `${(progress * 100.0).toFixed(1)}%`
  }

  get donutChartData () {
    const { stats, $theme } = this
    return [
      { value: stats.newCount, color: $theme.getColor('colorGrayLite') },
      { value: stats.inProgressCount, color: $theme.getColor('colorYellow') },
      { value: stats.completedCount, color: $theme.getColor('colorPrimaryLight') }
    ]
  }
}
</script>
