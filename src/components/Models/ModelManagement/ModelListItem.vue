<template>
  <div
    class="model-listitem"
    @click.once="onClick"
  >
    <div class="model-listitem__name">
      <p>{{ model.name }}</p>
    </div>
    <div class="model-listitem__type">
      <auto-annotate-icon v-if="modelType === 'Auto Annotate'" />
      <classification-icon v-if="modelType === 'Classification'" />
      <instance-segmentation-icon v-if="modelType === 'Instance Segmentation'" />
      <object-detection-icon v-if="modelType === 'Object Detection'" />
      <text-scanner-icon v-if="modelType === 'Text Scanner'" />
      <p>{{ modelType }}</p>
    </div>
    <div
      class="model-listitem__dataset"
      @click.stop
    >
      <router-link
        v-if="dataset"
        :to="`/datasets/${dataset.id}`"
        class="model-listitem__dataset__content"
      >
        {{ datasetName }}
      </router-link>
      <div
        v-else
        class="model-listitem__dataset__content"
      >
        {{ datasetName }}
      </div>
    </div>
    <div class="model-listitem__date">
      {{ time }}
    </div>
    <div class="model-listitem__status">
      <deploy-button
        v-if="!!model.trainedModel"
        :trained-model="model.trainedModel"
        @click.native.stop="() => {}"
      />
      <public-running-session-button
        v-else-if="modelIsPublicRunningSession"
        :running-session="model.runningSession"
        @click.native.stop="() => {}"
      />
      <update-button
        v-else-if="!!model.runningSession"
        :running-session="model.runningSession"
        @click.native.stop="() => {}"
      />
      <training-button
        v-else-if="!!model.trainingSession"
        :training-session="model.trainingSession"
        @click.native.stop="() => {}"
      />
    </div>
    <div class="model-listitem__more">
      <v-popover
        placement="left-start"
        popover-class="model-listitem__more__popover"
        trigger="manual"
        :open.sync="popoverVisible"
      >
        <button
          v-if="!!model.trainingSession"
          class="model-listitem__more__popover__trigger"
          @click.stop="popoverVisible = true"
        >
          <more-vertical-icon />
        </button>
        <template #popover>
          <div class="model-listitem__more__popover__list">
            <div
              class="model-listitem__more__popover__list__item"
              @click.stop="onDelete"
            >
              Delete
            </div>
          </div>
        </template>
      </v-popover>
    </div>
  </div>
</template>

<script lang="ts">
import { startCase, truncate } from 'lodash'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import { MoreVerticalIcon } from '@/assets/icons/V1'
import {
  IconDuotoneAutoAnnotate as AutoAnnotateIcon,
  IconDuotoneClassification as ClassificationIcon,
  IconDuotoneInstanceSegmentation as InstanceSegmentationIcon,
  IconDuotoneObjectDetection as ObjectDetectionIcon,
  IconDuotoneTextScanner as TextScannerIcon
} from '@/assets/icons/V2/Duotone'
import { ModelItem } from '@/components/Models/types'
import { DatasetPayload, TeamPayload, TrainedModelPayload } from '@/store/types'
import { getAgoString } from '@/utils/time'

import DeployButton from './DeployButton.vue'
import PublicRunningSessionButton from './PublicRunningSessionButton.vue'
import TrainingButton from './TrainingButton.vue'
import UpdateButton from './UpdateButton.vue'
import { datasetName } from './utils'

@Component({
  name: 'model-list-item',
  components: {
    AutoAnnotateIcon,
    ClassificationIcon,
    DeployButton,
    InstanceSegmentationIcon,
    MoreVerticalIcon,
    ObjectDetectionIcon,
    PublicRunningSessionButton,
    TextScannerIcon,
    TrainingButton,
    UpdateButton
  }
})
export default class ModelListItem extends Vue {
  @Prop({ required: true, type: Object })
  model!: ModelItem

  @Getter('findBySlug', { namespace: 'dataset' })
  datasetBySlug!: (slug: string) => DatasetPayload | null

  popoverVisible: boolean = false

  get dataset (): DatasetPayload | null {
    const { model: { datasetSlug: slug } } = this
    if (slug === null) { return null }
    return this.datasetBySlug(slug) || null
  }

  get datasetName (): string {
    return truncate(datasetName(this.dataset), { length: 25 })
  }

  @State(state => state.neuralModel.trainedModels)
  trainedModels!: TrainedModelPayload[]

  get modelType (): string {
    const { runningSession, trainedModel, trainingSession } = this.model

    if (runningSession) {
      const trainedModel = this.trainedModels.find(tm => tm.id === runningSession.trained_model_id)
      if (!trainedModel) { return 'N/A' }

      const { model_template: modelTemplate } = trainedModel
      return startCase(modelTemplate.type)
    }

    if (trainedModel) {
      const { model_template: modelTemplate } = trainedModel
      return startCase(modelTemplate.type)
    }

    if (trainingSession) {
      const { model_template: modelTemplate } = trainingSession
      return startCase(modelTemplate.type)
    }

    return 'N/A'
  }

  @State(state => state.team.currentTeam)
  team!: TeamPayload

  get modelIsPublicRunningSession (): boolean {
    const { model, team } = this

    if (!model.runningSession) { return false }
    // If the running session actually belongs to the team, they should be allow to update it
    if (team.id === model.teamId) { return false }

    return model.runningSession.access_level === 'public'
  }

  get time (): string {
    return getAgoString(this.model.insertedAt)
  }

  onClick (): void {
    const { model } = this
    this.$router.push(`/models/${model.id}`)
  }

  async onDelete (): Promise<void> {
    const { trainingSession } = this.model
    if (!trainingSession) { return }

    const { error } = await this.$store.dispatch('neuralModel/stopTrainingSession', this.model)

    if (error) {
      this.$store.dispatch('toast/warning', { content: error.message })
      return
    }

    this.popoverVisible = false
  }
}
</script>

<style lang="scss" scoped>
@import './modelListItem.scss';

.model-listitem {
  @include modelListItem;
  min-height: 40px;
  border-radius: 5px;
  transition: background-color 0.1s ease-in-out;

  &:hover {
    background-color: $colorAliceShade;
    cursor: pointer;
    transition: background-color 0.1s ease-in-out;
  }

  &__name {
    @include typography(md-1, inter, 500);
    color: $color90Black;
    letter-spacing: 0;
  }

  &__type {
    @include typography(md-1, inter);
    color: $color90Black;
    letter-spacing: 0;
    line-height: 23px;
  }

  &__dataset {
    &__content {
      @include typography(md-1, inter);
      color: $color90Black;
      display: inline-block;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__date {
    @include typography(md-1, inter);
    color: $color90Black;
    letter-spacing: 0;
  }

  &__status {
    @include typography(md-1, inter, bold);
    letter-spacing: 0.5px;
    color: $color90Black;
  }

  button {
    width: 100% !important;
  }
}

.model-listitem__more__popover__trigger {
  background: transparent;
  color: $colorAliceShadow;

  &:hover {
    color: $colorAliceNight;
  }
}

.model-listitem__more__popover__list {
  width: 150px;
}

.model-listitem__more__popover__list__item {
  padding: 0 5px;
  background-color: $colorWhite;
  height: 30px;
  @include typography(md-1);
  color: $color90Black;
  line-height: 30px;

  &:hover {
    background-color: $colorAliceShade;
  }

  &:first-child {
    margin-top: 5px;
  }

  &:last-child {
    margin-bottom: 5px;
  }
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.model-listitem__more__popover {
  @include dropdownBelow;
  border-radius: 3px;

  .tooltip-inner {
    background-color: $colorWhite;
    color: $colorSecondaryDark1;
    max-width: 250px;
    padding: 0;
    border-radius: 3px;
    overflow: hidden;
  }
}
</style>
