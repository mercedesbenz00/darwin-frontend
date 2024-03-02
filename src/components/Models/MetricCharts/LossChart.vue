<template>
  <div class="loss-chart">
    <div class="loss-chart__headers">
      <h2 class="loss-chart__header">
        Loss
      </h2>
      <h2
        v-if="latestValue"
        class="loss-chart__header"
      >
        {{ latestValue }}
      </h2>
      <tooltip-info
        content="
          <p>The loss function at the latest training epoch.</p>
          <p>The lower the loss, the fewer mistakes the model is making.</p>
          <p>A well-learning model follows a sloped L shape, approaching a flatter line.</p>
          <p>
            If your loss curve is spiky and not flattening, the data isn't being learnt from well.
          </p>"
        :html="true"
        placement="right"
      />
    </div>
    <line-chart
      class="loss-chart__plot"
      :chart-data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
<script lang="ts">
import { ChartOptions } from 'chart.js'
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import LineChart from '@/components/Dashboard/LineChart.vue'
import { ChartData } from '@/components/Dashboard/types'
import { metricChartData } from '@/components/Dashboard/utils'
import { metricLatestValue } from '@/components/Models/utils'
import { TrainingSessionPayload, MetricsPayload } from '@/store/types'
import { formatNumericValue } from '@/utils'

@Component({ name: 'loss-chart', components: { LineChart, TooltipInfo } })
export default class LossChart extends Vue {
  @Prop({ required: true, type: Object as () => TrainingSessionPayload })
  trainingSession!: TrainingSessionPayload

  @State(state => state.neuralModel.metrics)
  metrics!: Record<string, MetricsPayload>

  get latestValue () {
    const { lossMetric: metric } = this
    if (!metric) { return null }
    return metricLatestValue(metric)
  }

  get lossMetric () {
    const { trainingSessionMetrics } = this
    if (!trainingSessionMetrics) { return null }

    const metric = trainingSessionMetrics.find(metric => metric.name === 'train/loss')
    if (!metric) { return null }

    return metric
  }

  get minX () {
    const { lossMetric: metric } = this
    if (!metric) { return 0 }

    const { data } = metric
    if (data.length === 0) { return 0 }

    return data[0].x
  }

  get chartData (): ChartData {
    const { lossMetric: metric } = this
    if (!metric) { return { datasets: [] } }

    return { datasets: metricChartData(metric) }
  }

  get chartOptions (): ChartOptions {
    const { $theme, minX } = this
    return {
      elements: {
        line: {
          tension: 0
        }
      },
      legend: { display: false },
      maintainAspectRatio: false,
      hover: { mode: 'x-axis', intersect: false },
      tooltips: {
        mode: 'x-axis',
        enabled: true
      },
      scales: {
        yAxes: [{
          gridLines: { display: true },
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
          ticks: {
            beginAtZero: minX === 0,
            min: minX
          },
          type: 'linear'
        }]
      }
    }
  }

  get trainingSessionMetrics () {
    const { metrics, trainingSession } = this
    return metrics[trainingSession.id]
  }
}
</script>
<style lang="scss" scoped>
.loss-chart {
  margin: 20px 0;
  padding: 10px 20px;
}

.loss-chart__headers {
  @include row;
}

.loss-chart__header {
  @include typography(xl, headlines, bold);
  margin-bottom: 10px;
  margin-right: 30px;
}
</style>
