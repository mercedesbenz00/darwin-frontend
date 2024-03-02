<template>
  <stage-template class="test">
    <template #header>
      <test-round-icon class="test__header__icon" />
      <stage-title
        :value="name"
        @change="updateName"
      />
    </template>
    <template #body>
      <div class="test__body">
        <div class="test__body__header">
          <paragraph-10>Define the overlap (IoU) </paragraph-10>
          <iou-tooltip />
        </div>
        <div class="test__body__content">
          <div
            v-for="{type, label, threshold} in typeThresholds"
            :key="type"
            class="test__body__content__threshold"
          >
            <type-icon-with-label
              :type="type"
              :label="label"
            />
            <sampling-rate
              :value="threshold"
              @change="value => updateThreshold(type, value)"
            />
          </div>
        </div>
      </div>
    </template>
  </stage-template>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

import TestRoundIcon from '@/assets/icons/V1/testRound.svg?inline'
import TypeIconWithLabel from '@/components/Common/AnnotationType/TypeIconWithLabel.vue'
import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'
import MoveHandler from '@/components/Common/MoveHandler.vue'
import Paragraph10 from '@/components/Common/Paragraph10.vue'
import { AnnotationTypeName, TestStageTemplatePayload } from '@/store/types'
import { formatTypeName } from '@/utils'

import IouTooltip from './IouTooltip.vue'
import SamplingRate from './SamplingRate.vue'
import StageTemplate from './StageTemplate.vue'
import StageTitle from './StageTitle.vue'

const SUPPORTED_TYPES: AnnotationTypeName[] = ['bounding_box', 'polygon']

@Component({
  name: 'code-stage',
  components: {
    DeleteButton,
    IouTooltip,
    MoveHandler,
    Paragraph10,
    SamplingRate,
    StageTemplate,
    StageTitle,
    TestRoundIcon,
    TypeIconWithLabel
  }
})
export default class CodeStage extends Vue {
  @Prop({ required: false, default: false })
  deletable!: boolean

  @Prop({ required: true, type: Object as () => TestStageTemplatePayload })
  stage!: TestStageTemplatePayload

  get typeThresholds (): { type: AnnotationTypeName, label: string, threshold: number }[] {
    const thresholds = ('type_thresholds' in this.stage.metadata)
      ? this.stage.metadata.type_thresholds
      : {}
    return SUPPORTED_TYPES.map(type => ({
      label: formatTypeName(type),
      type,
      threshold: thresholds[type] || 0.9
    }))
  }

  get name (): string {
    return this.stage.name || ''
  }

  updateName (value: string): void {
    this.$emit('change', { ...this.stage, name: value })
  }

  updateThreshold (type: AnnotationTypeName, value: number): void {
    this.$emit('change', {
      ...this.stage,
      metadata: {
        ...this.stage.metadata,
        type_thresholds: {
          ...this.stage.metadata.type_thresholds,
          [type]: value
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.test__header__icon {
  height: 20px;
  width: 20px;
  color: $colorCodeOrange;
  border-radius: 50%;

  display: grid;
  align-items: center;
  justify-content: center;

  svg {
    height: 20px;
    width: 20px;
  }
}

.test__body {
  text-align: center;
  color: $colorAliceNight;
}

.test__body__header {
  border-bottom: 1px solid $colorAliceShadow;
}

.test__body__header > p {
  color: $colorAliceNight;
  font-weight: bold;
}

.test__body__header,
.test__body__content__threshold {
  height: 40px;
}

.test__body__header,
.test__body__content__threshold {
  @include row--distributed;
  align-items: center;
}
</style>
