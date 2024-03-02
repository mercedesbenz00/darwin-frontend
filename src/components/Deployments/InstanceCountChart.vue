<template>
  <div class="data">
    <div class="data__header">
      <h3>Server Usage</h3>
      <tab-selector
        :options="dataRanges"
        :value="dataRange"
        @change="dataRange = $event"
      />
    </div>
    <line-chart
      class="data__chart"
      :chart-data="chartData"
      :options="chartOptions"
    />
    <deployment-chart-tooltip
      v-if="tooltipDate"
      class="data__tooltip"
      :date="tooltipDate"
      :model="tooltipModel"
      :values="tooltipValues"
    />
  </div>
</template>
<script lang="ts">
import Chart from 'chart.js'
import minBy from 'lodash/minBy'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TabSelector from '@/components/Common/TabSelector/TabSelector.vue'
import { TabSelectorOption } from '@/components/Common/TabSelector/types'
import LineChart from '@/components/Dashboard/LineChart.vue'
import { GradientLineChartDataset, ChartData } from '@/components/Dashboard/types'
import DeploymentChartTooltip from '@/components/Deployments/DeploymentChartTooltip.vue'
import {
  loadRunningSessionInstanceCounts
} from '@/store/modules/neuralModel/actions/loadRunningSessionInstanceCounts'
import {
  RunningSessionInstanceCountPayload,
  RunningSessionPayload,
  StoreActionPayload
} from '@/store/types'
import { rgbaString, hexToRGBA, formatNumericValue } from '@/utils'

import {
  AdaptedInstanceCountDataPoint,
  InstanceCountDimension,
  DeploymentData,
  DeploymentDataRange
} from './types'
import { adaptInstanceCountReportData, buildFrom } from './utils'

const COUNT_RANGES: TabSelectorOption[] = [
  { value: 'total', description: 'Active instances per day since the model was first deployed' },
  { value: 'month', description: 'Active instances per day from the last 30 days' },
  { value: 'week', description: 'Active instances per hour from the last 7 days' },
  { value: 'day', description: 'Active instances per minute from the past 24 hours' }
]

@Component({
  name: 'instance-count-chart',
  components: {
    DeploymentChartTooltip,
    LineChart,
    TabSelector
  }
})
export default class InstanceCountChart extends Vue {
  @Prop({ required: true, type: Object })
  runningSession!: RunningSessionPayload

  dataRange: DeploymentDataRange = 'day'
  dataRanges = COUNT_RANGES

  /**
   * Determines lower bound of the chart
   *
   * Chart's upper bound is "now"
   * Chart's lower bound is computed from selected range
   * - total -> null
   * - month -> start of day 1 month ago
   * - week -> start of day 1 week ago
   * - day -> start of hour 1 day ago
   *
   * This part is computed by `buildFrom`
   *
   * This lower bound is used if there's enough data to cover the
   * entire range of the chart's bounds.
   *
   * If there's less data then that, the lower bound is set to the
   * lowest timestamp in data, which will always be higher than
   * the default lower bound.
   */
  get fromDate (): string | null {
    const defaultFrom = buildFrom(this.dataRange)
    if (this.loading) { return defaultFrom }

    const min = minBy(this.instanceCounts, 'reported_for')
    if (!min) { return defaultFrom }
    if (!defaultFrom) { return min.reported_for }
    return min.reported_for > defaultFrom ? min.reported_for : defaultFrom
  }

  get granularity (): 'day' | 'hour' | 'minute' {
    const { dataRange } = this
    if (dataRange === 'total') { return 'day' }
    if (dataRange === 'month') { return 'day' }
    if (dataRange === 'week') { return 'hour' }
    if (dataRange === 'day') { return 'minute' }
    throw new Error(`Invalid data range for instance count chart: ${dataRange}`)
  }

  @State(state => state.neuralModel.runningSessionInstanceCounts)
  allInstanceCounts!: RunningSessionInstanceCountPayload[]

  get instanceCounts (): RunningSessionInstanceCountPayload[] {
    const { allInstanceCounts, runningSession } = this
    return allInstanceCounts.filter(r => r.running_session_id === runningSession.id)
  }

  get adaptedInstanceCountData (): DeploymentData<AdaptedInstanceCountDataPoint> {
    const { instanceCounts, runningSession } = this
    const data = instanceCounts.map(adaptInstanceCountReportData)
    return { data, runningSession }
  }

  get datasets (): GradientLineChartDataset[] {
    const { data } = this.adaptedInstanceCountData
    const dimensions: InstanceCountDimension[] = ['activeCount', 'inactiveCount']

    const color = hexToRGBA(this.$theme.getColor('colorFeatherLight'))
    const gradient = { 0: rgbaString(color, 0.3), 0.5: 'rgba(255, 255, 255, 0)' }
    const fillColor = rgbaString(color, 1)

    // chart data has 2 dimensions - activeCount and inactiveCount,
    // but we only show the activeCount
    return [
      {
        data: data.map(d => ({ x: new Date(d.date), y: d[dimensions[0]] })),
        label: dimensions[0],
        backgroundColor: { gradient },
        borderColor: fillColor,
        borderWidth: 1,
        pointRadius: 0,
        pointBackgroundColor: fillColor,
        pointBorderWidth: 0,
        steppedLine: true
      }
    ]
  }

  get chartUnit (): 'minute' | 'hour' | 'day' {
    const { dataRange } = this
    if (dataRange === 'total') { return 'day' }
    if (dataRange === 'month') { return 'day' }
    if (dataRange === 'week') { return 'hour' }
    return 'minute'
  }

  get chartOptions (): Chart.ChartOptions {
    const vm = this
    const { chartUnit, fromDate, $theme } = this

    return {
      legend: { display: false },
      maintainAspectRatio: false,
      hover: { mode: 'x-axis', intersect: false },
      tooltips: {
        mode: 'x-axis',
        enabled: false,
        custom (model: Chart.ChartTooltipModel) {
          vm.resolveTooltipData(this, model)
        }
      },
      scales: {
        yAxes: [{
          gridLines: { display: false },
          ticks: {
            beginAtZero: true,
            callback: (value: number) => value % 1 === 0 ? formatNumericValue(value) : '',
            fontColor: $theme.getColor('colorAliceNight'),
            fontSize: 10
          }
        }],
        xAxes: [{
          display: false,
          gridLines: { display: false },
          ticks: { min: fromDate || undefined },
          time: { unit: chartUnit },
          type: 'time'
        }]
      }
    }
  }

  get chartData (): ChartData {
    return { datasets: this.datasets }
  }

  tooltipDate: string | null = null
  tooltipValues: { activeCount: number } | null = null
  tooltipModel: Chart.ChartTooltipModel | null = null

  resolveTooltipData (tooltip: any, model: Chart.ChartTooltipModel) {
    const dataPoints = tooltip._model.dataPoints as { xLabel: string, yLabel: number }[]

    this.tooltipDate = dataPoints && dataPoints[0] ? dataPoints[0].xLabel : ''
    this.tooltipValues = {
      activeCount: dataPoints && dataPoints[0].yLabel
    }
    this.tooltipModel = model
  }

  // loading

  mounted () {
    Chart.defaults.global.defaultFontFamily = 'Muli'
    this.loadData()
  }

  @Watch('dataRange')
  onDataRangeChange () {
    this.loadData()
  }

  loading: boolean = false

  async loadData () {
    this.loading = true

    const { fromDate: from, granularity, runningSession } = this
    const countPayload: StoreActionPayload<typeof loadRunningSessionInstanceCounts> =
      { granularity, runningSession }

    if (from) { countPayload.from = from }

    await this.$store.dispatch('neuralModel/loadRunningSessionInstanceCounts', countPayload)

    this.loading = false
  }
}
</script>

<style lang="scss" scoped>
.data {
  padding: 10px 20px;

  // needed for tooltip positioning
  position: relative;

  display: grid;
  grid-auto-flow: row;
  row-gap: 20px;
}

.data__chart {
  grid-row: 2 / 3;
  grid-column: 1 / 2;
}

.data__header {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
  height: 40px;
}

.data__header h3 {
  color: $colorBlack;
  @include typography(lg, headers, bold);
}

.data__chart {
  height: 250px;
}
</style>
