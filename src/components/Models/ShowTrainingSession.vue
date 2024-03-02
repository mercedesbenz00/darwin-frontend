<template>
  <div class="training-session">
    <metric-loader :training-session="trainingSession" />
    <bread-crumbs class="training-session__navigation" />
    <div class="training-session__header">
      <h1>{{ trainingSession.name }}</h1>
      <training-button
        :training-session="trainingSession"
        @click.native.stop
      />
    </div>
    <div class="training-session__section">
      <p>
        This model hasn't finished training yet. Come back later to run it.
        <span
          v-if="eta"
        >ETA: {{ eta }}</span>
      </p>
    </div>
    <div
      v-if="metrics"
      class="training-session__charts"
    >
      <loss-chart :training-session="trainingSession" />
    </div>
    <model-channel-subscriber />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import MetricLoader from '@/components/Renderless/MetricLoader'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import { MetricsPayload, TrainingSessionPayload } from '@/store/types'

import LossChart from './MetricCharts/LossChart.vue'
import TrainingButton from './ModelManagement/TrainingButton.vue'
import ModelChannelSubscriber from './Renderless/ModelChannelSubscriber'
import { metricLatestValue, secondsToEtaString } from './utils'

@Component({
  name: 'training-session',
  components: {
    BreadCrumbs,
    LossChart,
    MetricLoader,
    ModelChannelSubscriber,
    TrainingButton
  },
  mixins: [BreadCrumbInitializer]
})
export default class ShowTrainingSession extends Vue {
  @Prop({ required: true, type: Object as () => TrainingSessionPayload })
  trainingSession!: TrainingSessionPayload

  @State(state => state.neuralModel.metrics)
  metrics!: Record<string, MetricsPayload>

  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/models', name: 'Models' },
      { name: this.trainingSession.name }
    ]
  }

  get eta () {
    const { metrics, trainingSession } = this
    if (!metrics) { return null }

    const trainingSessionMetrics = metrics[trainingSession.id]
    if (!trainingSessionMetrics) { return null }

    const metric = trainingSessionMetrics.find(metric => metric.name === 'eta')
    if (!metric) { return null }

    const seconds = metricLatestValue(metric)
    return secondsToEtaString(seconds)
  }
}
</script>
<style lang="scss" scoped>
@import "./modelSettingsDialog.scss";

.training-session {
  padding: 25px 50px;
  position: relative;
  z-index: 2;
  display: grid;
  grid-auto-flow: row;
  align-content: start;
  row-gap: 25px;
  grid-template-columns: 100%;
}

.training-session__header {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
}

.training-session__header h1 {
  @include typography(xxl, headlines, bold);
  width: 100%;
}

.training-session__header button {
  width: 150px;
}

.training-session__section {
  background: $colorAliceShade;
  border-radius: 5px;
  color: $colorAliceNight;
  padding: 20px 25px;
  width: 100%;
}

.training-session__section p {
  @include typography(lg, headlines, bold);
  text-align: center;
}
</style>
