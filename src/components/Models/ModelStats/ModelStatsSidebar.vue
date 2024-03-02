<template>
  <div class="model-stats-sidebar">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="model-stats-sidebar__item"
    >
      <h2 class="model-stats-sidebar__item__name">
        {{ item.name }}
      </h2>
      <p class="model-stats-sidebar__item__data">
        {{ item.data }}
      </p>
    </div>
    <div
      v-if="trainingSession && isDetectionOrSegmentationType"
      class="model-stats-sidebar__item"
    >
      <h2 class="model-stats-sidebar__item__name">
        IoU for metrics
        <tooltip-info
          content="<p>A higher IoU threshold generates harsher metrics.</p>
          <p>Industry standards indicate a 50% threshold,</p>
          <p>meaning that a “correct” answer means IoU is over 50%.</p>"
          :html="true"
          placement="bottom"
        />
      </h2>
      <tab-selector
        class="selector"
        :options="iouTabOptions"
        :value="iouValue"
        @change="onIouValueChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import TabSelector from '@/components/Common/TabSelector/TabSelector.vue'
import { TabSelectorOption } from '@/components/Common/TabSelector/types'
import TooltipInfo from '@/components/Common/TooltipInfo.vue'
import { secondsToEtaString } from '@/components/Models/utils'
import { ModelType, TrainedModelPayload, TrainingSessionPayload } from '@/store/types'
import { dateFromUtcISO, formatRawDate } from '@/utils'

type ModelStatsSidebarItem = {
  name: string,
  data: string
}

@Component({ name: 'model-stats-sidebar', components: { TabSelector, TooltipInfo } })
export default class ModelStatsSidebar extends Vue {
  @Prop({ required: true })
  trainedModel!: TrainedModelPayload | null

  @State(state => state.neuralModel.trainingSessions)
  trainingSessions!: TrainingSessionPayload[]

  iouValue: string = '50%'

  get items (): ModelStatsSidebarItem[] {
    return [
      { name: 'Dataset Name', data: this.datasetName },
      { name: 'Training Set Size', data: this.trainingSetSize },
      { name: 'Total Training Time', data: this.totalTrainingTime },
      { name: 'Started Training On', data: this.startedTrainingOn },
      { name: 'Author Team', data: this.teamName }
    ]
  }

  get iouTabOptions (): TabSelectorOption[] {
    return [{ value: '50%' }, { value: '75%' }, { value: 'Avg' }]
  }

  get datasetName (): string {
    const { trainingSession } = this
    if (!trainingSession) { return 'N/A' }
    return trainingSession.dataset_identifier.split('/')[1]
  }

  get trainingSetSize (): string {
    const { trainingSession } = this
    if (!trainingSession) { return 'N/A' }

    const { training_stats: trainingStats } = trainingSession
    if (!trainingStats) { return 'N/A' }

    return `${trainingStats.train.item_count}`
  }

  get totalTrainingTime (): string {
    const { trainingSession } = this
    if (!trainingSession) { return 'N/A' }

    const { training_time_secs: trainingTimeSecs } = trainingSession
    if (!trainingTimeSecs) { return 'N/A' }

    return secondsToEtaString(trainingTimeSecs)
  }

  get startedTrainingOn (): string {
    const { trainingSession } = this
    if (!trainingSession) { return 'N/A' }
    return formatRawDate(dateFromUtcISO(trainingSession.inserted_at), 'DD/MM/YYYY HH:MM')
  }

  get teamName (): string {
    const { trainingSession } = this
    if (!trainingSession) { return 'N/A' }
    return trainingSession.dataset_identifier.split('/')[0]
  }

  get trainingSession (): TrainingSessionPayload | undefined {
    const { trainedModel, trainingSessions } = this
    if (!trainedModel) { return }
    return trainingSessions.find(ts => ts.trained_model_id === trainedModel.id)
  }

  onIouValueChange (value: string): void {
    this.iouValue = value
    this.$emit('iou', value)
  }

  get isDetectionOrSegmentationType (): boolean {
    if (!this.trainingSession) { return false }

    const { type } = this.trainingSession.model_template
    const validTypes = [ModelType.InstanceSegmentation, ModelType.ObjectDetection]
    return validTypes.includes(type)
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.model-stats-sidebar {
  border-right: 1px solid $colorAliceShadow;
  padding-right: 10px;
}

.model-stats-sidebar__item {
  margin-bottom: 30px;
}

.model-stats-sidebar__item__name {
  @include typography(md-1, default, bold);
  display: flex;
}

.model-stats-sidebar__item__name .info {
  margin-left: 10px;
}

.model-stats-sidebar__item__data {
  @include typography(md, default);
}

.selector .tab-select__button {
  padding-left: 0;
  padding-right: 0;
  width: 25%;
  margin-right: 0;
}
</style>
