<template>
  <div
    class="confidence-score"
    v-tooltip="confidenceTooltip"
    :style="{ backgroundColor, color }"
  >
    {{ score }}%
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { InferenceMetadata, ModelMetadata } from '@/engineCommon/backend'
import { hslaToRGBA, parseHSLA, rgbaString } from '@/utils'

@Component({ name: 'confidence-score' })
export default class ConfidenceScore extends Vue {
  @Prop({ required: true, type: String })
  classColor!: string

  @Prop({ default: null, type: Object || null })
  inferenceData!: InferenceMetadata | null

  @Prop({ required: true, type: String })
  name!: string

  get score (): number | null {
    const { inferenceData } = this
    if (!inferenceData) { return null }
    return Math.round(inferenceData.confidence * 100)
  }

  get model (): ModelMetadata | null {
    const { inferenceData } = this
    if (!inferenceData) { return null }
    return inferenceData.model
  }

  get hue (): number {
    const { score } = this
    if (!score) { return 0 }

    const adjustedScore = score < 50 ? 0 : score / 100 - 0.5
    return adjustedScore / 90 * 120 * 180
  }

  get backgroundColor (): string {
    const { hue } = this
    const color = parseHSLA(`hsl(${Math.round(hue)},52%,48%)`)
    const rgba = hslaToRGBA(color)
    const finalColor = {
      r: 255 - 0.24 * (255 - rgba.r),
      g: 255 - 0.24 * (255 - rgba.g),
      b: 255 - 0.24 * (255 - rgba.b),
      a: 1.0
    }
    return rgbaString(finalColor)
  }

  get color (): string {
    const { hue } = this
    return `hsl(${Math.round(hue)},52%,48%)`
  }

  get confidenceTooltip (): { content: string, classes: string } | undefined {
    const { classColor, color, model, name, score } = this
    if (!model) { return }
    return {
      content: `<div class="text">
        <span class="model-name">${model.name}</span>
        is <span style="color: ${color}">${score}%</span> confident that this is a
        <span style="color: ${classColor}">${name}</span>.
      </div>`,
      classes: 'confidence-tooltip'
    }
  }
}
</script>

<style lang="scss" scoped>
.confidence-score {
  align-self: flex-start;
  border-radius: 3px;
  width: auto;
  padding: 1px 2px;
  line-height: 12px;
  height: 12px;
  text-align: center;
  font-family: $fontFamilyInter;
  font-weight: 500;
  letter-spacing: -0.02em;
  font-size: 8px;
  vertical-align: middle;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.confidence-tooltip {
  width: 200px;
  max-width: 200px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 3px 4px;
  background-color: $colorSurfaceInverted;
  border-radius: 4px;
}

.confidence-tooltip .text {
  @include typography(md, default, 500);
  font-family: $fontFamilyInter;
}

.model-name {
  color: $colorStagesModelDefault;
}
</style>
<!-- eslint-enable vue-scoped-css/enforce-style-type -->
