<template>
  <div class="info">
    <div class="info__items">
      <div class="info__items__item">
        {{ imageCountFormatted }}
      </div>
    </div>
    <div class="info__items">
      <div class="info__items__item">
        {{ modelType }}
      </div>
      <div class="info__items__item">
        {{ classCountFormatted }}
      </div>
      <div class="info__items__item">
        {{ instanceCountFormatted }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  ModelTemplatePayload,
  ModelType,
  RootState,
  DatasetReportPayload
} from '@/store/types'
import { formatDecimal } from '@/utils'

const TYPE_LABELS: {[k in ModelType]: string } = {
  [ModelType.AutoAnnotation]: 'Auto-Annotation Model',
  [ModelType.Classification]: 'Classification Model',
  [ModelType.InstanceSegmentation]: 'Instance Segmentation Model',
  [ModelType.ObjectDetection]: 'Object Detection Model',
  [ModelType.SemanticSegmentation]: 'Semantic Segmentation Model',
  [ModelType.TextScanner]: 'Text Scanner Model'
}

@Component({ name: 'model-info' })
export default class ModelInfo extends Vue {
  // item counts

  @State((state: RootState) => state.neuralModel.newModelTrainingCounts)
  imageCount!: number | null

  get imageCountFormatted (): string | null {
    const { imageCount } = this
    if (imageCount === null) { return null }
    const countFormatted = formatDecimal(imageCount)

    if (imageCount === 0) { return 'No Images' }

    return imageCount > 1
      ? `${countFormatted} Images`
      : `${countFormatted} Image`
  }

  // model type

  @State(state => state.neuralModel.newModelTemplate)
  modelTemplate!: ModelTemplatePayload | null

  get modelType (): string | null {
    const { modelTemplate } = this
    if (!modelTemplate) { return null }
    return TYPE_LABELS[modelTemplate.type]
  }

  // class counts

  @State(state => state.neuralModel.newModelSelectedClassIds)
  classIds!: number[]

  get classCount (): number {
    return this.classIds.length
  }

  get classCountFormatted (): string {
    const { classCount } = this
    const countFormatted = formatDecimal(classCount)

    if (classCount === 0) { return 'No Classes' }

    return classCount > 1
      ? `${countFormatted} Classes`
      : `${countFormatted} Class`
  }

  // instance counts

  @State(state => state.neuralModel.newModelClassCounts)
  modelClassCounts!: DatasetReportPayload | null

  get instanceCount (): number {
    const { modelClassCounts, classIds } = this
    if (!modelClassCounts) { return 0 }

    return modelClassCounts.class_distribution_by_annotation_instance
      .filter(d => classIds.includes(d.id))
      .map(d => d.count)
      .reduce((a, b) => a + b, 0)
  }

  get instanceCountFormatted (): string {
    const { instanceCount } = this
    const countFormatted = formatDecimal(instanceCount)

    if (instanceCount === 0) { return 'No Instances' }

    return instanceCount > 1
      ? `${countFormatted} Instances`
      : `${countFormatted} Instance`
  }
}
</script>

<style lang="scss" scoped>
.info {
  display: grid;
  grid-auto-flow: row;
  row-gap: 10px;

}

.info__items {
  border-radius: 3px;
}

.info__items__item {
  width: 100%;
  padding: 10px 24px;
  @include typography(md-1, Mulish);
  background: $colorAliceShadow;
}

.info__items__item:first-child:last-child {
  background: $colorAliceShade;
  border-radius: 5px;
}

.info__items__item:first-child {
  background: $colorAliceShade;
  border-radius: 5px 5px 0 0;
}

.info__items__item:last-child {
  border-radius: 0 0 5px 5px;
}
</style>
