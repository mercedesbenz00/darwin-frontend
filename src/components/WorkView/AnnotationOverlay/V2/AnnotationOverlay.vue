<template>
  <div
    v-if="annotation && annotation.isVisible"
    class="annotation_overlay"
    :class="{
      'annotation_overlay__with-pill': hasPill
    }"
    :style="rootStyle"
  >
    <div
      v-if="hasPill"
      class="pill"
      :style="pillStyle"
      :class="{
        'pill--error': error,
        'pill--with-content': subAnnotationTypes.length > 0
      }"
      @mouseover="onMouseOver"
      @mouseleave="onMouseLeave"
    >
      <XIcon v-if="error" />
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
      <ConfidenceScore
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'

import { XIcon } from '@/assets/icons/V1'
import ConfidenceScore from '@/components/WorkView/ConfidenceScore/ConfidenceScore.vue'
import { useStore, useTheme } from '@/composables'
import { useAnnotation } from '@/composables/useEditorV2'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { SubToolConfig } from '@/engineV2/managers'
import { Annotation, View } from '@/engineV2/models'
import { OverlayRender } from '@/engineV2/plugins/instanceId/overlayer'
import { TextMeasurer, getRGBAColorHash, rgbaString } from '@/utils'
import { getAnnotationInferenceData } from '@/utilsV2/getAnnotationInferenceData'

/**
 * Renders overlays for an annotation rendered in canvas. This includes
 * - overlays for any subannotation that needs extra UI controls
 * - error indicator if in review stage that's part of a blind workflow, and the
 * annotation didn't pass thresholds in test stagte
 */
export default defineComponent({
  name: 'AnnotationOverlay',
  components: { ConfidenceScore, XIcon },
  props: {
    x: { required: true, type: Number },
    y: { required: true, type: Number },
    label: { required: true, type: String },
    annotationId: { required: true, type: String },
    subAnnotationTypes: { required: true, type: Array as () => AnnotationType[] },
    overlays: { required: true, type: Array as () => OverlayRender[] },
    editable: { required: false, type: Boolean, default: true },
    view: { required: true, type: Object as () => View },
    /**
     * Indicates if the annotation is marked as error in a blind workflow test
     * stage. Will be populated if we're currently in a review stage that follows
     * that test stage.
     */
    error: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const { state } = useStore()
    const theme = useTheme()

    const annotationOverlayDisabled = computed(() => state.workview.annotationOverlayDisabled)

    const measurer = ref<TextMeasurer | null>(null)
    const hover = ref(false)

    const annotation = useAnnotation(props.annotationId)

    const name = computed((): string => {
      return annotation.value?.label || ''
    })

    const mainColor = computed((): string => {
      if (!annotation.value?.annotationClass) {
        return rgbaString(getRGBAColorHash(name.value))
      }
      return rgbaString(annotation.value.annotationClass.color)
    })

    const pillRadius = computed((): number => {
      return (props.editable ? 8 : 5) * theme.getCurrentScale()
    })

    const subAnnotations = computed((): Annotation['subAnnotations'] => {
      if (!annotation.value) { return [] }
      return annotation.value.subAnnotations
    })

    const hasPill = computed(() =>
      props.subAnnotationTypes.length > 0 || props.error
    )

    const imageWidth = computed(() => props.view.camera.image.width || 1)
    const imageHeight = computed(() => props.view.camera.image.height || 1)
    const xPoint = computed(() => {
      const x = (props.x || 1)
      return `${(x * 100) / imageWidth.value}%`
    })
    const yPoint = computed(() => {
      const y = (props.y || 1)
      return `${(y * 100) / imageHeight.value}%`
    })

    const rootStyle = computed((): Record<string, string> => {
      if (props.subAnnotationTypes.length > 0) {
        return {
          top: yPoint.value,
          left: xPoint.value
        }
      }
      return {
        top: yPoint.value,
        left: xPoint.value
      }
    })

    const pillStyle = computed((): Record<string, string> => {
      let width = props.view.showPills ? pillRadius.value * 2 : 0
      if (hover.value && props.subAnnotationTypes.length > 0 && props.view.showPills) {
        // add the extra width of the pills for any additional sub annotation types
        width += (pillRadius.value - 1) * 2 * (props.subAnnotationTypes.length - 1)
      }

      const height = props.view.showPills ? pillRadius.value * 2 : 0
      const borderWidth = props.view.showPills ? 1 : 0
      const borderRadius = props.view.showPills ? pillRadius.value : 0

      return {
        width: `${width}px`,
        height: `${height}px`,
        border: `${mainColor.value} ${borderWidth}px solid`,
        borderRadius: `${borderRadius}px`,
        pointerEvents: annotationOverlayDisabled.value ? 'none' : 'auto'
      }
    })

    const subAnnotationToolStyle = computed((): Record<string, string> => {
      return {
        width: `${(pillRadius.value - 1) * 2}px`,
        height: `${(pillRadius.value - 1) * 2}px`,
        borderRadius: `${pillRadius.value}px`
      }
    })

    const subAnnotationToolIconStyle = computed((): Record<string, string> => {
      const size = (pillRadius.value - 4 * theme.getCurrentScale()) * 2
      return {
        width: Math.floor(size) + 'px',
        height: Math.floor(size) + 'px'
      }
    })

    const classLabelStyle = computed((): Record<string, string | undefined> => {
      let offset = 0
      // If the annotation is keypoint class, just add more offset to avoid overlay.
      if (annotation.value?.type === 'keypoint') {
        offset += 5 * theme.getCurrentScale()
      }
      if (props.subAnnotationTypes.length > 0) {
        offset += 3 * theme.getCurrentScale()
        if (hover.value && props.subAnnotationTypes.length > 0) {
          // when the pill get scaled to twice the size we need to move offset to match
          offset += pillRadius.value * props.subAnnotationTypes.length
        }
      }
      const marginLeft = props.view.showPills
        ? `${offset}px`
        : (props.subAnnotationTypes.length === 0 ? '0' : `calc(-50% + ${pillRadius.value * 2}px)`)
      const marginTop = props.view.showPills ? undefined : `${-pillRadius.value * 2}px`

      return {
        background: mainColor.value,
        height: `${pillRadius.value * 2}px`,
        marginTop,
        marginLeft
      }
    })

    const overlaysStyle = computed((): Record<string, string> => {
      let offset = 0
      if (props.subAnnotationTypes.length > 0) {
        offset += 3 + pillRadius.value * 2
        if (hover.value && props.subAnnotationTypes.length > 0) {
          // when the pill get scaled to twice the size we need to move offset to match
          offset += pillRadius.value * props.subAnnotationTypes.length
        }
      }
      offset = props.view.showPills ? offset : 0
      return {
        marginLeft: `${offset}px`
      }
    })

    const inferenceData = computed(() => {
      if (!annotation.value) { return }
      return getAnnotationInferenceData(annotation.value, props.view.editor)
    })

    onMounted((): void => {
      measurer.value = new TextMeasurer()
    })

    const subAnnotationIcon = (subAnnotation: AnnotationType): string => {
      const tool = props.view.editor.toolManager.findByName(`${subAnnotation.name}_tool`)
      if (!tool) { return '' }
      const toolConfig = tool.toolConfig as SubToolConfig
      return toolConfig.icon
    }

    const selectSubAnnotationTool = (subAnnotationType: AnnotationType): void => {
      if (!annotation.value) { return }
      props.view.editor.toolManager.activateTool(`${subAnnotationType.name}_tool`, {
        sub: { master: annotation.value }
      })
    }

    const onMouseOver = (): void => {
      hover.value = true
    }

    const onMouseLeave = (): void => {
      hover.value = false
    }

    return {
      hasPill,
      annotation,
      pillRadius,
      selectSubAnnotationTool,
      subAnnotationIcon,
      inferenceData,
      mainColor,
      name,
      overlaysStyle,
      classLabelStyle,
      subAnnotationToolIconStyle,
      subAnnotationToolStyle,
      pillStyle,
      rootStyle,
      subAnnotations,
      onMouseOver,
      onMouseLeave
    }
  }
})
</script>

<style lang="scss" scoped>
$labelHeight: 9px;
$pillRadius: 8px;

.annotation_overlay {
  position: absolute;
  pointer-events: none;
  @include noSelect;
  padding: 2px;
  transform-origin: center;
  transform: translate(-50%, -$labelHeight);

  &__with-pill {
    transform: translate(-$pillRadius, -$labelHeight);
  }
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
  cursor: url(../../assets/cursors/cursor_move.svg) 2 2, default;
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
