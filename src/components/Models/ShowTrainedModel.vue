<template>
  <div class="trained-model">
    <metric-loader
      v-if="trainingSession"
      :training-session="trainingSession"
    />
    <bread-crumbs class="trained-model__navigation" />
    <div class="trained-model__header">
      <h1>{{ trainedModel.name }}</h1>
      <!-- For compatibility with click-outside on deploy-settings -->
      <deploy-button
        :trained-model="trainedModel"
        @click.native.stop
      />
    </div>
    <div class="trained-model__section">
      <p>This model has not been started</p>
    </div>
    <model-stats :trained-model="trainedModel" />
    <by-class-map-model-stat
      :trained-model="trainedModel"
      :dataset-distributions="datasetDistributions"
      v-if="modelType === 'object_detection'"
    />
    <confusion-matrix
      :trained-model="trainedModel"
      v-if="modelType === 'classification'"
    />
    <div
      v-if="metrics && trainingSession"
      class="trained-model__charts"
    >
      <loss-chart :training-session="trainingSession" />
    </div>
    <div class="trained-model__api">
      <api-key-management :model="trainedModel" />
    </div>
    <deploy-settings class="trained-model__deployer" />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import MetricLoader from '@/components/Renderless/MetricLoader'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import DatasetReportLoader from '@/mixins/DatasetReportLoader'
import {
  MetricsPayload, TrainedModelPayload, TrainingSessionPayload
} from '@/store/types'

import ApiKeyManagement from './ApiKeyManagement.vue'
import LossChart from './MetricCharts/LossChart.vue'
import DeployButton from './ModelManagement/DeployButton.vue'
import DeploySettings from './ModelManagement/DeploySettings.vue'
import ModelMetrics from './ModelMetrics.vue'
import ByClassMapModelStat from './ModelStats/ByClassMapModelStat.vue'
import ConfusionMatrix from './ModelStats/ConfusionMatrix.vue'
import ModelStats from './ModelStats/ModelStats.vue'

@Component({
  name: 'trained-model',
  components: {
    ApiKeyManagement,
    BreadCrumbs,
    ByClassMapModelStat,
    ConfusionMatrix,
    DeployButton,
    DeploySettings,
    LossChart,
    MetricLoader,
    ModelMetrics,
    ModelStats
  },
  mixins: [BreadCrumbInitializer, DatasetReportLoader]
})
export default class ShowModel extends Vue {
  @State(state => state.neuralModel.metrics)
  metrics!: Record<string, MetricsPayload>

  @Prop({ required: true, type: Object as () => TrainedModelPayload })
  trainedModel!: TrainedModelPayload

  @Prop({ required: false })
  trainingSession!: TrainingSessionPayload | undefined

  get modelType (): string | null {
    return this.trainedModel?.model_template?.type
  }

  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/models', name: 'Models' },
      { name: this.trainedModel.name }
    ]
  }
}
</script>
<style lang="scss" scoped>
@import "./modelSettingsDialog.scss";

.trained-model {
  padding: 25px 50px;
  position: relative;
  z-index: 2;
  display: grid;
  grid-auto-flow: row;
  align-content: start;
  row-gap: 25px;
  grid-template-columns: 100%;
}

.trained-model__header {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
}

.trained-model__header h1 {
  @include typography(xxl, headlines, bold);
  width: 100%;
}

.trained-model__header h1:focus {
  outline: none;
}

.trained-model__section {
  background: $colorAliceShade;
  border-radius: 5px;
  color: $colorAliceNight;
  padding: 20px 25px;
  width: 100%;
}

.trained-model__section p {
  @include typography(lg, headlines, bold);
  text-align: center;
}

.trained-model__deployer {
  @include modelSettingsDialog;
}

.trained-model__stats__header {
  @include row--distributed;
  height: 60px;
}

.trained-model__stats__header h1 {
  @include typography(xl, default, bold);
}
</style>
