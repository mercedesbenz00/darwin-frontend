<template>
  <alice-blue-panel class="type">
    <div class="type__selection">
      <h2 class="type__selection__header">
        Pick a Model Type
      </h2>
      <type-selection class="type__selection__types" />
      <template-selection />
      <div class="type__selection__name-continue">
        <label
          class="type__selection__name-continue__label"
          for="model-name"
        >Name the Model</label>
        <model-name-input />
        <primary-button
          :disabled="!valid"
          @click="$emit('continue')"
        >
          Continue
        </primary-button>
      </div>
    </div>
    <component
      :is="typeInfo.details"
      class="type__preview preview"
    />
  </alice-blue-panel>
</template>

<script lang="ts" scoped>
import { Component, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import AliceBluePanel from '@/components/Common/Panel/AliceBluePanel.vue'
import { NeuralModelValidationErrors } from '@/store/modules/neuralModel/types'
import { ModelTemplatePayload, ModelType } from '@/utils/wind/types'

import ModelNameInput from './ModelNameInput.vue'
import TemplateSelection from './TemplateSelection.vue'
import AutoAnnotateDetails from './TypeDetails/AutoAnnotateDetails.vue'
import ClassificationDetails from './TypeDetails/ClassificationDetails.vue'
import InstanceSegmentationDetails from './TypeDetails/InstanceSegmentationDetails.vue'
import ObjectDetectionDetails from './TypeDetails/ObjectDetectionDetails.vue'
import SemanticSegmentationDetails from './TypeDetails/SemanticSegmentationDetails.vue'
import TypeSelection from './TypeSelection.vue'
import { TYPES } from './data'
import { ModelTypeDefinition } from './types'

@Component({
  name: 'model-type-setup',
  components: {
    AliceBluePanel,
    AutoAnnotateDetails,
    ClassificationDetails,
    InstanceSegmentationDetails,
    ModelNameInput,
    ObjectDetectionDetails,
    SemanticSegmentationDetails,
    TemplateSelection,
    TypeSelection
  }
})
export default class ModelTypeSetup extends Vue {
  @State(state => state.neuralModel.newModelTemplate)
  selectedTemplate!: ModelTemplatePayload

  get selectedTemplateId (): string | null {
    const { selectedTemplate } = this
    return selectedTemplate ? selectedTemplate.id : null
  }

  @State(state => state.neuralModel.newModelType)
  type!: ModelType

  get typeInfo (): ModelTypeDefinition {
    const { type } = this
    const matched = TYPES.find(t => t.id === type)
    if (!matched) { throw new Error(`Invalid type id: ${type}`) }
    return matched
  }

  @State(state => state.neuralModel.newModelValidationErrors)
  validationErrors!: NeuralModelValidationErrors

  get valid (): boolean {
    const { name, template } = this.validationErrors
    return [name, template].filter(i => !!i).length === 0
  }
}

</script>
<style lang="scss" scoped>
.type {
  display: grid;
  grid-template-columns: 1fr 309px;

// override default padding given by alice-blue-panel

  padding: 0;
}

.type__header {
  z-index: 2;
  grid-column: 1 / 3;
}

.type__selection {
  z-index: 2;
  justify-content: start;
  align-content: start;
  // reintroduce alice-blue-panel padding on left side only
  padding: 40px;

  border-radius: 5px;
  background: $colorAliceBlue;
  padding: 40px;
  display: grid;
  grid-template-rows: auto auto auto auto;
  row-gap: 20px;
  justify-content: stretch;
  align-content: space-between;
}

.type__preview {
  background: $colorAliceShadow;
  z-index: 1;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  width: 309px;
}

.type__selection__header {
  @include typography(xl-1, mulish, bold);
  font-size: 22px;
}

.type__selection__name-continue {
  display: grid;

  grid-template-columns: minmax(200px, 500px) auto;
  justify-content: space-between;
  align-items: center;
  column-gap: 10px;
}

.type__selection__name-continue__label {
  grid-column: 1 / 3;
  @include typography(md-1, default);
  color: $colorAliceNight;
}
</style>
