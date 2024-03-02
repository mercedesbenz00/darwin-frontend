<template>
  <div class="data">
    <div class="data__header">
      <h3>Requests</h3>
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
      :values="tooltipValues"
      :model="tooltipModel"
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
import { loadInferenceRequests } from '@/store/modules/neuralModel/actions/loadInferenceRequests'
import {
  InferenceRequestCountPayload,
  RunningSessionPayload,
  StoreActionPayload
} from '@/store/types'
import { formatNumericValue, rgbaString, RGBA } from '@/utils'

import {
  AdaptedModelRequestDataPoint,
  ModelRequestDimension,
  DeploymentDataRange,
  DeploymentData
} from './types'
import { adaptModelRequestReportData, buildFrom } from './utils'

const DATA_RANGES: TabSelectorOption[] = [
  { value: 'total', description: 'Requests per day since the model was first deployed' },
  { value: 'month', description: 'Requests per day from the last 30 days' },
  { value: 'week', description: 'Requests per hour from the last 7 days' },
  { value: 'day', description: 'Requests per minute from the past 24 hours' }
]

@Component({
  name: 'model-request-chart',
  components: {
    DeploymentChartTooltip,
    LineChart,
    TabSelector
  }
})
export default class ModelRequestChart extends Vue {
  @Prop({ required: true, type: Object })
  runningSession!: RunningSessionPayload

  dataRange: DeploymentDataRange = 'day'
  dataRanges = DATA_RANGES

  @State(state => state.neuralModel.runningSessionRequestCounts)
  allRequests!: InferenceRequestCountPayload[]

  get requests (): InferenceRequestCountPayload[] {
    const { allRequests, runningSession } = this
    return allRequests.filter(r => r.running_session_id === runningSession.id)
  }

  // chart/report data

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

    const min = minBy(this.requests, 'date')
    if (!min) { return defaultFrom }
    if (!defaultFrom) { return min.date }
    return min.date > defaultFrom ? min.date : defaultFrom
  }

  get granularity (): 'day' | 'hour' | 'minute' {
    const { dataRange } = this
    if (dataRange === 'total') { return 'day' }
    if (dataRange === 'month') { return 'day' }
    if (dataRange === 'week') { return 'hour' }
    if (dataRange === 'day') { return 'minute' }
    throw new Error(`Invalid data range for model request chart: ${dataRange}`)
  }

  get adaptedModelRequestData (): DeploymentData<AdaptedModelRequestDataPoint> {
    const { requests, runningSession } = this
    const data = requests.map(adaptModelRequestReportData)
    return { runningSession, data }
  }

  get datasets (): GradientLineChartDataset[] {
    const { data } = this.adaptedModelRequestData
    const dimensions: ModelRequestDimension[] = ['successfulRequests', 'failedRequests']
    const colors: RGBA[] = [{ r: 0, g: 217, b: 201, a: 1.0 }, { r: 222, g: 122, b: 122, a: 1.0 }]
    const gradients =
      colors.map(color => ({ 0: rgbaString(color, 0.3), 0.5: 'rgba(255, 255, 255, 0)' }))
    const fillColors = colors.map(color => rgbaString(color, 1))

    const options = []

    for (let i = 0; i < dimensions.length; i += 1) {
      options.push({
        data: data.map(d => ({ x: new Date(d.date), y: d[dimensions[i]] })),
        label: dimensions[i],
        backgroundColor: { gradient: gradients[i] },
        borderColor: fillColors[i],
        borderWidth: 1,
        pointRadius: 0,
        pointBackgroundColor: fillColors[i],
        pointBorderWidth: 0
      })
    }

    return options
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
  tooltipValues: {
    successfulRequests: number,
    failedRequests: number
  } | null = null

  tooltipModel: Chart.ChartTooltipModel | null = null

  resolveTooltipData (tooltip: any, model: Chart.ChartTooltipModel) {
    const dataPoints = tooltip._model.dataPoints as { xLabel: string, yLabel: number }[]

    this.tooltipDate = dataPoints && dataPoints[0] ? dataPoints[0].xLabel : ''
    this.tooltipValues = {
      successfulRequests: dataPoints && dataPoints[0].yLabel,
      failedRequests: dataPoints && dataPoints[1].yLabel
    }
    this.tooltipModel = model
  }

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

    const payload: StoreActionPayload<typeof loadInferenceRequests> =
      { granularity, runningSession }
    if (from) { payload.from = from }

    await this.$store.dispatch('neuralModel/loadInferenceRequests', payload)

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
