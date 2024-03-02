<template>
  <button
    class="types__type type"
    :class="{'type--selected': type.id === selectedType}"
    :disabled="!type.available"
    @click="setSelectedType"
  >
    <blue-pill
      v-if="!type.available"
      class="type__modifier"
    >
      Coming soon
    </blue-pill>
    <purple-pill
      v-else-if="type.mostAccurate"
      class="type__modifier"
    >
      Most accurate
    </purple-pill>
    <component
      :is="icon"
      class="type__icon"
    />
    <div class="type__name">
      {{ type.name }}
    </div>
  </button>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { State } from 'vuex-class'

import BluePill from '@/components/Common/Pill/BluePill.vue'
import PurplePill from '@/components/Common/Pill/PurplePill.vue'
import { ModelTemplatePayload, ModelType } from '@/store/types'

import AutoAnnotateIcon from './assets/types/auto-annotate.svg?inline'
import ClassificationIcon from './assets/types/classification.svg?inline'
import InstanceSegmentationIcon from './assets/types/instance-segmentation.svg?inline'
import ObjectDetectionIcon from './assets/types/object-detection.svg?inline'
import SemanticSegmentationIcon from './assets/types/semantic-segmentation.svg?inline'
import { ModelTypeInfo } from './types'

const ICONS: Record<ModelType, string> = {
  [ModelType.AutoAnnotation]: 'auto-annotate-icon',
  [ModelType.Classification]: 'classification-icon',
  [ModelType.InstanceSegmentation]: 'instance-segmentation-icon',
  [ModelType.ObjectDetection]: 'object-detection-icon',
  [ModelType.SemanticSegmentation]: 'semantic-segmentation-icon',
  [ModelType.TextScanner]: 'text-scanner-icon'
}

@Component({
  name: 'type-item',
  components: {
    AutoAnnotateIcon,
    BluePill,
    ClassificationIcon,
    InstanceSegmentationIcon,
    ObjectDetectionIcon,
    PurplePill,
    SemanticSegmentationIcon
  }
})
export default class TypeItem extends Vue {
  @Prop({ required: true, type: Object as () => ModelTypeInfo })
  type!: ModelTypeInfo

  @State(state => state.neuralModel.newModelType)
  selectedType!: ModelType

  @State(state => state.neuralModel.modelTemplates)
  templates!: ModelTemplatePayload[]

  setSelectedType (): void {
    const { type } = this
    this.$store.commit('neuralModel/SET_NEW_MODEL_TYPE', type.id)

    // When selecting a model type, make sure to also set the model template
    // to some template whose type matches the selected type
    const template = this.templates.find(t => t.type === type.id) || null
    this.$store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
  }

  get icon (): string {
    return ICONS[this.type.id]
  }
}
</script>

<style lang="scss" scoped>
.type {
  transition: all .2s ease;
  transition-property: background-color, border-color, color, opacity;
  border: 2px solid $colorAliceShadow;
  border-radius: 5px;
  background: transparent;

  display: grid;
  grid-template-rows: 1fr 5fr 3fr;
  row-gap: 10px;

  padding: 20px;
}

.type:hover:not(:disabled),
.type--selected {
  border-color: $colorAliceNight;
  background-color: $colorAliceShade;
}

.type:disabled {
  border-color: rgba($colorAliceShadow, 0.3);
  color: rgba($colorBlack, 0.3);

  svg {
    opacity: 0.3;
  }
}

.type__modifier {
  align-self: start;
  justify-self: end;

  min-width: 100px;
}

.type__modifier {
  grid-row: 1 / 2;
}

.type__icon {
  grid-row: 2 / 3;
  justify-self: center;
}

.type__name {
  grid-row: 3 / 4;
  @include typography(md-1, mulish, bold);
  align-self: center;
}
</style>
