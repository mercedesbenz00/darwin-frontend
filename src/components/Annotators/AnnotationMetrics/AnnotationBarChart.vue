<template>
  <div class="data">
    <div class="data__header">
      <div class="data__header__chart-toggles">
        <all-toggle
          class="stats__chart-toggles__all"
          :selected="selectedUserId === null"
          :label="false"
          @click="selectedUserId = null"
        />
        <member-toggle
          v-for="{ member } in annotationData.filter(d => !!d.member)"
          :key="member.id"
          class="stats__chart-toggles__annotator"
          :member="member"
          :label="false"
          :selected="selectedUserId === member.user_id"
          @click="selectedUserId = member.user_id"
        />
      </div>
    </div>
    <bar-chart
      class="data__chart"
      :chart-data="chartData"
      :options="chartOptions"
    />
    <annotation-bar-chart-tooltip
      v-if="tooltipData"
      class="data__tooltip"
      :approved="tooltipData.approved"
      :date="tooltipData.date"
      :model="tooltipData.model"
      :rejected="tooltipData.rejected"
      v-bind="tooltipData"
    />
  </div>
</template>
<script lang="ts">
import Chart from 'chart.js'
import { minBy } from 'lodash'
import moment from 'moment'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import BarChart from '@/components/Dashboard/BarChart.vue'
import {
  DatasetAnnotationReportPayload,
  DatasetPayload,
  DatasetAnnotatorPayload,
  MembershipPayload,
  UserPayload
} from '@/store/types'
import { getFullName, formatDate, formatNumericValue } from '@/utils'

import AnnotationBarChartTooltip from './AnnotationBarChartTooltip.vue'
import AllToggle from './Common/AllToggle.vue'
import MemberToggle from './Common/MemberToggle.vue'
import { AnnotationDataRange, AnnotationBarChartData, AnnotationDataGranularity } from './types'
import {
  aggregateByDate,
  buildFrom,
  chartFormat,
  dateRange,
  expandData,
  fromFromRange,
  granularityFromRange
} from './utils'

const containsRelevantData = (d: DatasetAnnotationReportPayload): boolean =>
  d.images_annotated > 0 || d.images_approved > 0 || d.images_rejected > 0

@Component({
  name: 'annotation-bar-chart',
  components: {
    AllToggle,
    AnnotationBarChartTooltip,
    BarChart,
    MemberToggle
  }
})
export default class AnnotationBarChart extends Vue {
  @Prop({ required: true, type: Array })
  byUserReport!: DatasetAnnotationReportPayload[]

  @Prop({ required: true, type: Array })
  totalReport!: DatasetAnnotationReportPayload[]

  @Prop({ required: true, type: String })
  dataRange!: AnnotationDataRange

  get from (): string | null {
    return fromFromRange(this.dataRange)
  }

  get dataGranularity (): AnnotationDataGranularity {
    return granularityFromRange(this.dataRange)
  }

  @Prop({ required: true, type: Object })
  dataset!: DatasetPayload

  get tooltipFormat () {
    if (this.dataGranularity === 'hour') { return 'MMMM Do, YYYY HH:00' }
    return 'MMMM Do, YYYY'
  }

  @Getter('relevantTeamMemberships', { namespace: 'team' })
  teamMembers!: MembershipPayload[]

  @Getter('annotatorsForDataset', { namespace: 'dataset' })
  annotatorsForDataset!: (datasetId: number) => DatasetAnnotatorPayload[]

  @State(state => state.user.profile)
  user!: UserPayload

  get datasetAnnotatorUserIds (): number[] {
    return this.$can('view_full_datasets')
      ? this.annotatorsForDataset(this.dataset.id).map(annotator => annotator.user_id)
      : [this.user.id]
  }

  // data filtering and adapting

  selectedUserId: number | null = null

  // chart/report data

  get minDate (): string {
    const oldestReport = minBy(this.totalReport.concat(this.byUserReport), ad => ad.date)
    return oldestReport ? oldestReport.date : moment.utc().startOf('year').format(this.format)
  }

  get fromDate (): string {
    if (this.dataRange === 'total') { return this.minDate }
    return buildFrom(this.dataRange)
  }

  get format () {
    return chartFormat(this.dataGranularity)
  }

  get dates () {
    return dateRange(this.fromDate, this.dataGranularity, this.format)
  }

  get aggregateData (): AnnotationBarChartData {
    return {
      data: this.dates.map(date => aggregateByDate(date, this.totalReport))
    }
  }

  get annotationData (): AnnotationBarChartData[] {
    const annotationData: AnnotationBarChartData[] = []

    this.teamMembers.forEach(member => {
      const reports = this.byUserReport.filter(ad => ad.user_id === member.user_id)
      /**
       * If member is not an annotator, just check if they have annotated or not
       * If yes, show them. If no, hide them
       *
       * If member is an annotator, check if they have taken part in the
       * annotation of this dataset or not. This means they are shown even if
       * they got removed from the dataset, as long as they made annotations
       * in the past.
       *
       * If member is an annotator and is included in the current dataset,
       * show them regardless of them having made any annotations
       */
      if (
        reports.some(r => containsRelevantData(r)) ||
        (member.role === 'annotator' && this.datasetAnnotatorUserIds.includes(member.user_id))
      ) {
        const data = expandData(member, reports, this.dates)
        annotationData.push({ data, member })
      }
    })

    return annotationData
  }

  get currentData (): AnnotationBarChartData | null {
    const { annotationData, aggregateData, selectedUserId } = this
    return selectedUserId
      ? annotationData.find(d => d.member && d.member.user_id === selectedUserId) || null
      : aggregateData
  }

  get datasets (): Chart.ChartDataSets[] {
    const { currentData: source } = this
    if (!source) { return [] }

    const approvedData = source.data
      .map(d => ({ x: new Date(d.date), y: d.images_approved || 0 }))
    const approvedColor = this.$theme.getColor('colorPrimaryLight')

    const rejectedData = source.data
      .map(d => ({ x: new Date(d.date), y: d.images_rejected || 0 }))
    const rejectedColor = this.$theme.getColor('colorPinkLite2')

    const name = source.member ? getFullName(source.member) : 'All'

    const base = { label: name, borderWidth: 1, fill: true }

    return [
      { ...base, data: approvedData, backgroundColor: approvedColor, borderColor: approvedColor },
      { ...base, data: rejectedData, backgroundColor: rejectedColor, borderColor: rejectedColor }
    ]
  }

  get chartOptions (): Chart.ChartOptions {
    const vm = this

    return {
      legend: { display: false },
      responsive: true,
      maintainAspectRatio: false,
      hover: { mode: 'x-axis', intersect: false },
      layout: { padding: -5 },
      tooltips: {
        mode: 'x-axis',
        enabled: false,
        custom (model: Chart.ChartTooltipModel) {
          vm.resolveTooltipData(this, model)
        }
      },
      scales: {
        yAxes: [{
          gridLines: { color: this.$theme.getColor('colorSecondaryLight2') },
          stacked: true,
          ticks: {
            beginAtZero: true,
            suggestedMax: 5,
            precision: 0,
            callback: formatNumericValue,
            fontFamily: this.$theme.fonts.headlines,
            fontColor: this.$theme.getColor('colorSecondaryLight')
          } as Chart.LinearScale
        }],
        xAxes: [{
          stacked: true,
          gridLines: { display: false },
          type: 'time',
          ticks: {
            minRotation: 0,
            maxRotation: 0,
            fontFamily: this.$theme.fonts.headlines,
            fontColor: this.$theme.getColor('colorSecondaryLight')
          },
          time: {
            minUnit: this.dataGranularity as Chart.TimeUnit,
            tooltipFormat: this.tooltipFormat
          }
        }]
      }
    }
  }

  get chartData (): Chart.ChartData {
    return { datasets: this.datasets }
  }

  tooltipData: {
    approved: number,
    date: string
    model: Chart.ChartTooltipModel
    rejected: number
  } | null = null

  resolveTooltipData (tooltip: any, model: Chart.ChartTooltipModel): void {
    const { currentData } = this
    if (!currentData || tooltip._active.length === 0) {
      this.tooltipData = null
      return
    }
    const index = tooltip._active[0]._index as number
    const dataPoint = currentData.data[index]

    const data = {
      approved: dataPoint.images_approved,
      model,
      rejected: dataPoint.images_rejected,
      date: formatDate(dataPoint.date, this.tooltipFormat)
    }

    this.tooltipData = data
  }
}
</script>

<style lang="scss" scoped>
.data {
  width: 100%;
  @include col;

  // needed for tooltip positioning
  position: relative;
}

.data__header {
  @include row--right;
  margin: 15px 0 20px 0;
}

.data__header__chart-toggles {
  @include row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: -10px;
}

.data__header__chart-toggles > * {
  margin-top: 10px;
}

.data__header__chart-toggles > *:not(:first-child) {
  margin-left: 10px;
}

.data__header__title__note {
  font-size: 12px;
  margin-top: 10px;
  @include typography(md, default, normal);
  color: $colorGrayLite;
  overflow: auto;
}

.data__chart {
  position: relative;
  width: 100%;
  height: 270px;
}

// Fixes responsiveness of chart on resize
.data__chart :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}
</style>
