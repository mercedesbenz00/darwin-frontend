<template>
  <div class="session">
    <metric-loader
      v-if="trainingSession"
      :training-session="trainingSession"
    />
    <bread-crumbs class="session__navigation" />
    <div class="session__header">
      <h1>{{ runningSession.name }}</h1>
      <!-- For compatibility with click-outside on update-settings -->
      <public-running-session-button
        v-if="runningSessionIsPublic"
        :running-session="runningSession"
        @click.native.stop="() => {}"
      />
      <update-button
        v-else
        :running-session="runningSession"
        @click.native.stop
      />
    </div>
    <div class="session__inference">
      <model-inference
        v-if="running"
        :running-session="runningSession"
      />
      <p
        v-else
        class="session__section"
      >
        This model has not been started
      </p>
    </div>
    <model-stats :trained-model="trainedModel" />
    <by-class-map-model-stat
      v-if="modelType === 'object_detection'"
      :trained-model="trainedModel"
      :dataset-distributions="datasetDistributions"
    />
    <confusion-matrix
      :trained-model="trainedModel"
      v-if="modelType == 'classification'"
    />
    <div class="session__stats">
      <div class="session__stats__header">
        <h1>Usage Metrics</h1>
      </div>
      <deployment-stats
        :running-session="runningSession"
        :data-range="dataRange"
      />
      <div
        v-if="metrics && trainingSession"
        class="session__stats__header"
      >
        <h1>Training Metrics</h1>
      </div>
      <div
        v-if="metrics && trainingSession"
        class="session__charts"
      >
        <loss-chart :training-session="trainingSession" />
      </div>
    </div>
    <div class="session__api">
      <api-key-management :model="runningSession" />
    </div>
    <update-settings class="session__updater" />
    <model-channel-subscriber />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import BreadCrumbs from '@/components/Common/BreadCrumbs/V1/BreadCrumbs.vue'
import DeploymentStats from '@/components/Deployments/DeploymentStats.vue'
import MetricLoader from '@/components/Renderless/MetricLoader'
import BreadCrumbInitializer, { BreadCrumb } from '@/mixins/BreadCrumbInitializer'
import DatasetReportLoader from '@/mixins/DatasetReportLoader'
import {
  MetricsPayload,
  RunningSessionPayload,
  TeamPayload,
  TrainedModelPayload,
  TrainingSessionPayload
} from '@/store/types'

import ApiKeyManagement from './ApiKeyManagement.vue'
import LossChart from './MetricCharts/LossChart.vue'
import ModelInference from './ModelInference.vue'
import PublicRunningSessionButton from './ModelManagement/PublicRunningSessionButton.vue'
import UpdateButton from './ModelManagement/UpdateButton.vue'
import UpdateSettings from './ModelManagement/UpdateSettings.vue'
import ModelMetrics from './ModelMetrics.vue'
import ByClassMapModelStat from './ModelStats/ByClassMapModelStat.vue'
import ConfusionMatrix from './ModelStats/ConfusionMatrix.vue'
import ModelStats from './ModelStats/ModelStats.vue'
import ModelChannelSubscriber from './Renderless/ModelChannelSubscriber'

@Component({
  name: 'show-running-session',
  components: {
    ApiKeyManagement,
    BreadCrumbs,
    ByClassMapModelStat,
    ConfusionMatrix,
    DeploymentStats,
    LossChart,
    MetricLoader,
    ModelChannelSubscriber,
    ModelInference,
    ModelMetrics,
    ModelStats,
    PublicRunningSessionButton,
    UpdateButton,
    UpdateSettings
  },
  mixins: [BreadCrumbInitializer, DatasetReportLoader]
})
export default class ShowRunningSession extends Vue {
  get breadCrumbs (): BreadCrumb[] {
    return [
      { to: '/models', name: 'Models' },
      { name: this.runningSession.name }
    ]
  }

  @Prop({ required: true, type: Object as () => RunningSessionPayload })
  runningSession!: RunningSessionPayload

  @Prop({ required: false })
  trainingSession!: TrainingSessionPayload | undefined

  @State(state => state.neuralModel.metrics)
  metrics!: Record<string, MetricsPayload>

  dataRange: string = 'total'

  get running (): boolean {
    return this.runningSession.meta.num_instances_available > 0
  }

  @State(state => state.neuralModel.trainedModels)
  trainedModels!: TrainedModelPayload[]

  get trainedModel (): TrainedModelPayload | null {
    const { runningSession, trainedModels } = this
    return trainedModels.find(m => m.id === runningSession.trained_model_id) || null
  }

  @State(state => state.team.currentTeam)
  team!: TeamPayload

  get modelType (): string | undefined {
    return this.trainedModel?.model_template?.type
  }

  get runningSessionIsPublic (): boolean {
    const { runningSession, team } = this

    // If the running session actually belongs to the team, they should be allow to update it
    if (team.id === runningSession.team_id) { return false }

    return runningSession.access_level === 'public'
  }
}
</script>
<style lang="scss" scoped>
@import "./modelSettingsDialog.scss";

.session {
  padding: 25px 50px;
  position: relative;
  z-index: 2;
  display: grid;
  grid-auto-flow: row;
  align-content: start;
  row-gap: 25px;
  grid-template-columns: 100%;
}

.session__header {
  display: grid;
  grid-auto-flow: column;
  justify-content: space-between;
  align-items: center;
}

.session__header h1 {
  @include typography(xl-2, headlines, bold);
  width: 100%;
}

.session__header h1:focus {
  outline: none;
}

.session__section {
  background: $colorAliceShade;
  color: $colorAliceNight;
  padding: 20px 25px;
  width: 100%;
}

.session__inference p {
  @include typography(lg, headlines, bold);
  text-align: center;
}

.session__stats__header {
  @include row--distributed;
  height: 60px;
}

.session__stats__header h1 {
  @include typography(xl, default, bold);
}

.session__updater {
  @include modelSettingsDialog;
}
</style>
