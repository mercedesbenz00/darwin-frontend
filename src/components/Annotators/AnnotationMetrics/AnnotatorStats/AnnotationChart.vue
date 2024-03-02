<template>
  <div class="data">
    <div class="data__header">
      <div class="data__header__title">
        <h3>{{ labels[dimension] }}</h3>
        <div class="data__header__title__note">
          Metrics are updated every hour. Times are in GMT+0.
        </div>
      </div>
      <div class="data__header__chart-toggles">
        <slot />
      </div>
    </div>
    <line-chart
      class="data__chart"
      :chart-data="chartData"
      :options="chartOptions"
    />
    <annotation-chart-tooltip
      v-if="tooltipData.length > 0"
      class="data__tooltip"
      :data="tooltipData"
      :model="tooltipModel"
      :title="tooltipTitle"
    />
  </div>
</template>
<script lang="ts">
import Chart from 'chart.js'
import { Component, Vue, Prop } from 'vue-property-decorator'

import { dimensionLabels } from '@/components/Annotators/AnnotationMetrics/data'
import {
  AnnotationChartData,
  ChartDimension,
  ChartTooltipData
} from '@/components/Annotators/AnnotationMetrics/types'
import LineChart from '@/components/Dashboard/LineChart.vue'
import { GradientLineChartDataset, ChartData } from '@/components/Dashboard/types'
import { MembershipPayload } from '@/store/types'
import {
  formatDurationAsSpan,
  formatNumericValue,
  formatPercentageValue,
  getColorHash,
  getFullName,
  hexToRGBA,
  RGBA,
  rgbaString,
  parseRGBA
} from '@/utils'

import AnnotationChartTooltip from './AnnotationChartTooltip.vue'

const formatters: { [k in ChartDimension]: Function } = {
  annotationTime: formatDurationAsSpan,
  imagesAnnotated: formatNumericValue,
  avgTimePerAnnotation: formatNumericValue,
  annotationsCreated: formatNumericValue,
  reviewPassRate: formatPercentageValue
}

@Component({ name: 'annotation-chart', components: { AnnotationChartTooltip, LineChart } })
export default class AnnotationChart extends Vue {
  @Prop({ required: true, type: Array })
  annotationData!: AnnotationChartData[]

  @Prop({ required: true, type: String })
  dimension!: ChartDimension

  @Prop({ required: true, type: String })
  dataGranularity!: 'hour' | 'day'

  labels: { [k in ChartDimension]: string } = dimensionLabels

  // chart toggling

  toggleDataset (member: MembershipPayload | null, event: MouseEvent) {
    if (!member) {
      this.$emit('toggle-all')
    } else {
      this.$emit(event.shiftKey ? 'toggle-except' : 'toggle', member)
    }
  }

  get tooltipFormat () {
    if (this.dataGranularity === 'hour') { return 'MMMM Do, YYYY HH:00' }
    return 'MMMM Do, YYYY'
  }

  // data filtering and adapting

  get datasets (): GradientLineChartDataset[] {
    return this.annotationData.filter(d => d.visible).map(source => {
      const name = source.member ? getFullName(source.member) : 'All'
      const identifier = source.member ? source.member.id + name.trim() : 'all'

      const color = this.computeDatasetColor(identifier)
      const gradient = { 0: rgbaString(color, 0.3), 0.5: 'rgba(255, 255, 255, 0)' }
      const fillColor = rgbaString(color, 1)

      return ({
        data: source.data.map(d => ({ x: new Date(d.date), y: d[this.dimension] || 0 })),
        label: name,
        backgroundColor: { gradient },
        borderColor: fillColor,
        borderWidth: 1,
        pointRadius: 0,
        pointBackgroundColor: fillColor,
        pointBorderWidth: 0,
        fill: true
      })
    })
  }

  private computeDatasetColor (identifier: string): RGBA {
    return identifier === 'all'
      ? hexToRGBA(this.$theme.getColor('colorPrimaryLight'))
      : parseRGBA(getColorHash(identifier, 'rgba') as string)
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
          ticks: {
            callback: (value: number) => formatters[this.dimension](value),
            fontFamily: this.$theme.fonts.headlines,
            fontColor: this.$theme.getColor('colorSecondaryLight')

          }
        }],
        xAxes: [{
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

  get chartData (): ChartData {
    return { datasets: this.datasets }
  }

  tooltipData: ChartTooltipData[] = []
  tooltipModel: Chart.ChartTooltipModel | null = null
  tooltipTitle: string | null = null

  resolveTooltipData (tooltip: any, model: Chart.ChartTooltipModel): void {
    const activeData = tooltip._active as { _index: number, _datasetIndex: number}[]
    const dataPoints = tooltip._model.dataPoints as { xLabel: string, yLabel: number }[]

    const data = activeData.map((i) => ({
      member: this.annotationData.filter(d => d.visible)[i._datasetIndex].member || null,
      value: formatters[this.dimension](dataPoints[i._datasetIndex].yLabel) as string
    }))

    this.tooltipData = data

    const title = dataPoints && dataPoints[0] ? dataPoints[0].xLabel : ''

    this.tooltipTitle = title
    this.tooltipModel = model
  }
}
</script>

<style lang="scss" scoped>
.data {
  background: $colorWhite;
  padding: 15px 20px;

  // needed for tooltip positioning
  position: relative;
}

.data__header {
  @include row--distributed;
  align-items: flex-start;
  margin: 15px 0 20px 0;
}

.data__header h3 {
  @include typography(xl, headers, bold);
  flex: 1 0 auto;
  margin-right: 35px;
  margin-top: 5px;
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
}
</style>
