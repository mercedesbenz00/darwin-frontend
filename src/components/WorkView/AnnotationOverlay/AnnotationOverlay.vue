<template>
  <lazy
    v-if="annotation && annotation.isVisible"
    class="annotation_overlay"
    :style="rootStyle"
    :x="x"
    :y="y"
    :width="labelWidth"
    :height="pillRadius"
    :viewport-element="viewportElement"
  >
    <div
      v-if="subAnnotationTypes.length > 0 || error"
      class="pill"
      :style="pillStyle"
      :class="{
        'pill--error': error,
        'pill--with-content': subAnnotationTypes.length > 0
      }"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <x-icon v-if="error" />
      <div
        v-for="type in subAnnotationTypes"
        :key="type.name"
        class="sub-annotation-tool"
        :style="subAnnotationToolStyle"
        @click="selectSubAnnotationTool(type)"
      >
        <img
          :src="subAnnotationIcon(type)"
          class="sub-annotation-tool-icon"
          :style="subAnnotationToolIconStyle"
        >
      </div>
    </div>
    <div class="labels">
      <div
        class="class-label"
        :style="classLabelStyle"
      >
        {{ name }}
      </div>
      <confidence-score
        class="confidence"
        v-if="inferenceData"
        :class-color="mainColor"
        :inference-data="inferenceData"
        :name="name"
      />
    </div>
    <div
      class="overlays"
      :style="overlaysStyle"
    >
      <div
        v-for="overlay in overlays"
        :key="overlay.text"
        class="overlay-container"
      >
        <div
          class="overlay-border"
          :style="overlay.borderStyle"
        >
          <div
            class="overlay-border-color overlay-border__color-1"
            :style="overlay.color1Style"
          />
          <div
            class="overlay-border-color overlay-border__color-2"
            :style="overlay.color2Style"
          />
          <div
            class="overlay-border-color overlay-border__color-3"
            :style="overlay.color3Style"
          />
        </div>
        <div
          class="overlay"
          :style="overlay.style"
        >
          {{ overlay.text }}
        </div>
      </div>
    </div>
  </lazy>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { XIcon } from '@/assets/icons/V1'
import Lazy from '@/components/Common/Lazy'
import ConfidenceScore from '@/components/WorkView/ConfidenceScore/ConfidenceScore.vue'
import { SubToolConfig } from '@/engine/managers'
import { Annotation, View } from '@/engine/models'
import { OverlayRender } from '@/engine/plugins/instanceId/overlayer'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { RootState } from '@/store/types'
import {
  TextMeasurer,
  getAnnotationInferenceData,
  getRGBAColorHash,
  rgbaString
} from '@/utils'

/**
 * Renders overlays for an annotation rendered in canvas. This includes
 * - overlays for any subannotation that needs extra UI controls
 * - error indicator if in review stage that's part of a blind workflow, and the
 * annotation didn't pass thresholds in test stagte
 */
@Component({
  name: 'annotation-overlay',
  components: { ConfidenceScore, Lazy, XIcon }
})
export default class extends Vue {
  @Prop({ required: true, type: Number })
  x!: number

  @Prop({ required: true, type: Number })
  y!: number

  @Prop({ required: true, type: String })
  label!: string

  @Prop({ required: true, type: Object })
  annotation!: Annotation

  @Prop({ required: true, type: Array })
  subAnnotationTypes!: AnnotationType[]

  @Prop({ required: true, type: Array })
  overlays!: OverlayRender[]

  @Prop({ required: false, type: Boolean, default: true })
  editable!: boolean

  @Prop({ required: true, type: Object })
  view!: View

  /**
   * Indicates if the annotation is marked as error in a blind workflow test
   * stage. Will be populated if we're currently in a review stage that follows
   * that test stage.
   */
  @Prop({ required: false, default: false, type: Boolean })
  error!: boolean

  @State((state: RootState) => state.workview.annotationOverlayDisabled)
  annotationOverlayDisabled!: boolean

  measurer: TextMeasurer | null = null;
  labelWidth: number = 0;
  hover = false

  get viewportElement (): HTMLElement | null {
    const mainView = this.view.annotationsLayer.canvas?.parentElement
    return mainView || null
  }

  get mainColor (): string {
    if (!this.annotation?.annotationClass) {
      return rgbaString(getRGBAColorHash(this.name))
    }
    return rgbaString(this.annotation.annotationClass.color)
  }

  get name (): string {
    return this.annotation?.label || ''
  }

  get pillRadius (): number {
    return (this.editable ? 8 : 5) * this.$theme.getCurrentScale()
  }

  get subAnnotations (): Annotation['subAnnotations'] {
    if (!this.annotation) { return [] }
    return this.annotation.subAnnotations
  }

  get rootStyle (): Record<string, string> {
    if (this.subAnnotationTypes.length > 0 || !this.labelWidth) {
      return {
        top: (this.y - this.pillRadius) + 'px',
        left: (this.x - this.pillRadius) + 'px'
      }
    }
    return {
      top: (this.y - this.pillRadius) + 'px',
      left: (this.x - this.labelWidth / 2 - 8 * this.$theme.getCurrentScale()) + 'px'
    }
  }

  get pillStyle (): Record<string, string> {
    let width = this.view.showPills ? this.pillRadius * 2 : 0
    if (this.hover && this.subAnnotationTypes.length > 0 && this.view.showPills) {
      // add the extra width of the pills for any additional sub annotation types
      width += (this.pillRadius - 1) * 2 * (this.subAnnotationTypes.length - 1)
    }

    const height = this.view.showPills ? this.pillRadius * 2 : 0
    const borderWidth = this.view.showPills ? 1 : 0
    const borderRadius = this.view.showPills ? this.pillRadius : 0

    return {
      width: `${width}px`,
      height: `${height}px`,
      border: `${this.mainColor} ${borderWidth}px solid`,
      borderRadius: `${borderRadius}px`,
      pointerEvents: this.annotationOverlayDisabled ? 'none' : 'auto'
    }
  }

  get subAnnotationToolStyle (): Record<string, string> {
    return {
      width: `${(this.pillRadius - 1) * 2}px`,
      height: `${(this.pillRadius - 1) * 2}px`,
      borderRadius: `${this.pillRadius}px`
    }
  }

  get subAnnotationToolIconStyle (): Record<string, string> {
    const size = (this.pillRadius - 4 * this.$theme.getCurrentScale()) * 2
    return {
      width: Math.floor(size) + 'px',
      height: Math.floor(size) + 'px'
    }
  }

  get classLabelStyle (): Record<string, string | undefined> {
    let offset = 0
    // If the annotation is keypoint class, just add more offset to avoid overlay.
    if (this.annotation?.type === 'keypoint') {
      offset += 5 * this.$theme.getCurrentScale()
    }
    if (this.subAnnotationTypes.length > 0) {
      offset += 3 * this.$theme.getCurrentScale()
      if (this.hover && this.subAnnotationTypes.length > 0) {
        // when the pill get scaled to twice the size we need to move offset to match
        offset += this.pillRadius * this.subAnnotationTypes.length
      }
    }
    const marginLeft = this.view.showPills
      ? `${offset}px`
      : (this.subAnnotationTypes.length === 0 ? '0' : `calc(-50% + ${this.pillRadius * 2}px)`)
    const marginTop = this.view.showPills ? undefined : `${-this.pillRadius * 2}px`

    return {
      background: this.mainColor,
      height: `${this.pillRadius * 2}px`,
      marginTop,
      marginLeft
    }
  }

  get overlaysStyle (): Record<string, string> {
    let offset = 0
    if (this.subAnnotationTypes.length > 0) {
      offset += 3 + this.pillRadius * 2
      if (this.hover && this.subAnnotationTypes.length > 0) {
        // when the pill get scaled to twice the size we need to move offset to match
        offset += this.pillRadius * this.subAnnotationTypes.length
      }
    }
    offset = this.view.showPills ? offset : 0
    return {
      marginLeft: `${offset}px`
    }
  }

  get inferenceData () {
    if (!this.annotation) { return }
    return getAnnotationInferenceData(this.annotation, this.view.editor)
  }

  @Watch('name')
  onNameChange (): void {
    this.calculateLabelWidth()
  }

  mounted (): void {
    this.measurer = new TextMeasurer()
    this.calculateLabelWidth()
  }

  subAnnotationIcon (subAnnotation: AnnotationType): string {
    const tool = this.view.editor.toolManager.findByName(`${subAnnotation.name}_tool`)
    if (!tool) { return '' }
    const toolConfig = tool.toolConfig as SubToolConfig
    return toolConfig.icon
  }

  selectSubAnnotationTool (subAnnotationType: AnnotationType): void {
    if (!this.annotation) { return }
    this.view.editor.activateTool(`${subAnnotationType.name}_tool`, {
      sub: { master: this.annotation }
    })
  }

  calculateLabelWidth (): void {
    if (!this.measurer) {
      this.labelWidth = 0
      return
    }

    this.labelWidth = this.measurer.calculateWidth(
      this.name,
      `normal ${this.$theme.getCurrentBreakpointFontSize('xs')}px Mulish`
    )
  }
}

</script>

<style lang="scss" scoped>
.annotation_overlay {
  position: absolute;
  pointer-events: none;
  @include noSelect;
  padding: 2px;
}

.pill {
  pointer-events: auto;
  float: left;
  transition: all ease .1s;
  transition-property: transform, background-color, border-color;
  background-color: $colorWhite;
  transform: scale(1);
  cursor: pointer;

  &.pill--with-content:hover {
    transform: scale(2);

    .sub-annotation-tool {
      visibility: visible !important;
      object {
        opacity: 1.0;
      }

      &:hover {
        object {
          opacity: .7;
        }
      }
    }
  }
}

.pill:not(:hover) .sub-annotation-tool {
  display: none;
}

.pill--error:not(.pill--with-content:hover) {
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: transparent;
  background-color: $colorCrimsonLight;
}

.pill--error svg {
  color: $colorWhite;
  height: 60%;
  width: 60%;
}

.pill--error.pill--with-content:hover svg { display: none }

.sub-annotation-tool {
  position: relative;
  margin: 0;
  padding: 2px;
  float: left;
  overflow: hidden;
  visibility: hidden;
  cursor: pointer;
  background: $colorWhite;
  @include row--center;

  object {
    cursor: pointer;
    opacity: 0;
  }

  &:hover, &:active {
    background: $colorPrimaryLight2;
  }

  &:hover {
    object {
      opacity: .7;
    }
  }

  &:active {
    object {
      opacity: 1;
    }
  }
}

.sub-annotation-tool-icon {
  z-index: 2;
  cursor: pointer;
}

.labels {
  @include row;
  align-items: center;
}

.class-label {
  color: $colorWhite;
  border-radius: $border-radius-default;
  padding: 3px 5px;
  margin-right: 5px;
  cursor: url(../assets/cursors/cursor_move.svg) 2 2, default;
  @include noSelect;
  @include row--center;
  text-shadow: 0 0 10px black;
  overflow: hidden;
  white-space: nowrap;
  @include typographyRegularBody50;
  text-align: center;
}

.confidence {
  align-self: flex-start;
  @include typographyRegularBody25;
  width: auto;
  height: auto;
}

.overlays {
  pointer-events: none;
  clear: both;
  display: flex;
  flex-wrap: wrap;
  max-width: 150px;
  margin-top: 20px;
}

.overlay-container {
  margin: 2px 5px 2px 0;
}

.overlay {
  border-radius: $border-radius-default;
  margin: 0;
  padding: 0 5px;
  vertical-align: middle;
  @include noSelect;
  @include typography(md);
  color: $colorSecondaryDark1;
  float: left;
  background: green;
}

.overlay-border {
  @include row;
}

.overlay-border-color {
  width: 33%;
  height: 100%;
}
</style>
