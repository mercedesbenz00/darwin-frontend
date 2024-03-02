<template>
  <component
    :is="iconTag"
    v-tooltip="tooltip"
    class="model-icon"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import {
  AutoAnnotateIcon,
  ClassificationIcon,
  InstanceSegmentationIcon,
  ObjectDetectionIcon,
  TextScannerIcon
} from '@/components/WorkView/ToolModelSelection/ModelSelectionDropdown/V2'
import { ModelType } from '@/store/types'
import { TooltipOptions } from '@/types'

@Component({
  name: 'v2-model-icon',
  components: {
    AutoAnnotateIcon,
    ClassificationIcon,
    InstanceSegmentationIcon,
    ObjectDetectionIcon,
    TextScannerIcon
  }
})
export default class V2ModelIcon extends Vue {
  @Prop({ required: true })
  modelType!: ModelType

  get iconTag (): string {
    switch (this.modelType) {
    case ModelType.Classification:
      return 'classification-icon'
    case ModelType.InstanceSegmentation:
      return 'instance-segmentation-icon'
    case ModelType.ObjectDetection:
      return 'object-detection-icon'
    case ModelType.TextScanner:
      return 'text-scanner-icon'
    default:
      return 'auto-annotate-icon'
    }
  }

  get tooltip (): TooltipOptions {
    return {
      placement: 'bottom',
      content: this.modelType
        .replace('_', ' ')
        .replace('-', ' '),
      classes: 'tooltip--model-icon',
      delay: { show: 300, hide: 300 }
    }
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.tooltip--model-icon {
  .tooltip-inner {
    text-transform: capitalize
  }
}
</style>

<style lang="scss" scoped>
.model-icon {
  &:hover,
  &:focus,
  &:active {
    outline: none;
  }
}
</style>
