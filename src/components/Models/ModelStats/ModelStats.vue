<template>
  <div class="model-stats">
    <h1 class="model-stats__title">
      Model Stats
    </h1>
    <div class="model-stats__container">
      <model-stats-sidebar
        :trained-model="trainedModel"
        @iou="onIouValueEmitted"
      />
      <div
        v-if="modelTemplate && isDetectionOrSegmentationType"
        class="model-stats__container__content"
      >
        <map-model-stat
          :iou-value="iouValue"
          :trained-model="trainedModel"
        />
        <precision-model-stat />
        <recall-model-stat />
        <iou-model-stat />
      </div>
      <div
        v-if="isClassificationType"
        class="model-stats__container__content"
      >
        <accuracy-model-stat :trained-model="trainedModel" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import { ModelTemplatePayload, ModelType, TrainedModelPayload } from '@/store/types'

import AccuracyModelStat from './AccuracyModelStat.vue'
import IoUModelStat from './IoUModelStat.vue'
import MAPModelStat from './MAPModelStat.vue'
import ModelStatsSidebar from './ModelStatsSidebar.vue'
import PrecisionModelStat from './PrecisionModelStat.vue'
import RecallModelStat from './RecallModelStat.vue'

@Component({
  name: 'model-stats',
  components: {
    AccuracyModelStat,
    'iou-model-stat': IoUModelStat,
    'map-model-stat': MAPModelStat,
    ModelStatsSidebar,
    PrecisionModelStat,
    RecallModelStat
  }
})
export default class ModelStats extends Vue {
  @Prop({ required: true })
  trainedModel!: TrainedModelPayload | null

  iouValue: string = '50%'

  onIouValueEmitted (value: string): void {
    this.iouValue = value
  }

  get modelTemplate (): ModelTemplatePayload | null {
    const { trainedModel } = this

    if (!trainedModel) { return null }

    return trainedModel.model_template
  }

  get isClassificationType (): boolean {
    return this.modelTemplate?.type === 'classification'
  }

  get isDetectionOrSegmentationType (): boolean {
    if (!this.modelTemplate) { return false }

    const { type } = this.modelTemplate
    const validTypes = [ModelType.InstanceSegmentation, ModelType.ObjectDetection]
    return validTypes.includes(type)
  }
}
</script>

<style lang="scss" scoped>
.model-stats__title {
  @include typography(xl, default, bold);
  margin-bottom: 20px;
}

.model-stats__container {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: minmax(200px, 20%) minmax(calc(100% - 200px), 80%);
  column-gap: 30px;
}

.model-stats__container__content * {
  padding-bottom: 40px;
}
</style>
