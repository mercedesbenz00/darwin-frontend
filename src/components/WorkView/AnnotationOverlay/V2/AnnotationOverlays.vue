<template>
  <div
    v-if="showSubAnnotations"
    :style="rootStyle"
  >
    <AnnotationOverlay
      v-for="overlay in overlaysWithErrors"
      :key="overlay.id"
      :view="view"
      :x="overlay.x || 1"
      :y="overlay.y || 1"
      :label="overlay.label"
      :annotation-id="overlay.annotationId"
      :sub-annotation-types="filterSubAnnotations(overlay)"
      :overlays="overlay.overlays"
      :error="overlay.error"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onBeforeUnmount, onMounted } from 'vue'

import { useStore } from '@/composables'
import { useOverlays } from '@/composables/useEditorV2'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import { Camera } from '@/engineCommon/camera'
import { Point } from '@/engineCommon/point'
import { AnnotationOverlayData } from '@/engineV2/models'
import { retrieveAutoAnnotateData } from '@/engineV2/plugins/click/utils'
import { View } from '@/engineV2/views'
import {
  StageType,
  TestStageTemplatePayload
} from '@/store/types'

import AnnotationOverlay from './AnnotationOverlay.vue'

type OverlayWithError = AnnotationOverlayData & { error: boolean }

export default defineComponent({
  name: 'AnnotationOverlays',
  components: { AnnotationOverlay },
  props: {
    view: { required: true, type: Object as () => View }
  },
  setup (props) {
    const { state } = useStore()

    const showSubAnnotations = computed(() => state.workview.renderSubAnnotations)
    const item = computed(() => state.workview.selectedDatasetItem)
    const stage = computed(() => state.workview.selectedStageInstance)

    const view = computed(() => props.view)
    const overlays = useOverlays(view)

    const cameraOffset = ref({ x: 0, y: 0 })

    const rootStyle = computed(() => ({
      position: 'absolute',
      top: `${-cameraOffset.value.y}px`,
      left: `${-cameraOffset.value.x}px`,
      width: `${
        (view.value.camera.image.width || 1) * view.value.camera.scale
      }px`,
      height: `${
        (view.value.camera.image.height || 1) * view.value.camera.scale
      }px`,
      pointerEvents: 'none'
    }))

    const onOffsetChanged = (offset: Point<any>): void => {
      cameraOffset.value = offset
    }

    onMounted(() => {
      onOffsetChanged(view.value.camera.offset)
      view.value.camera.on(Camera.OFFSET_CHANGED, onOffsetChanged)
    })

    /**
     * Returns relevant test stage type thresholds. Only valid when currently
     * rendering annotations in review stage of a blind workflow, that directly
     * follows a test stage.
     */
    const typeThresholds = computed((): TestStageTemplatePayload['metadata']['type_thresholds'] => {
      if (!item.value || !stage.value) { return {} }
      if (!item.value.current_workflow) { return {} }
      if (stage.value.type !== StageType.Review) { return {} }
      const { number } = stage.value
      const previousStage = item.value.current_workflow.stages[number - 1]?.[0]
      if (previousStage?.type !== StageType.Test) { return {} }
      return previousStage.template_metadata.type_thresholds
    })

    /**
     * Same as `overlays`, but with an additional `error` key, which is `true` if
     * - this is a review stage that directly follows a blind workflow test stage
     * - the annotation IOU is bellow appropriate threshold
     */
    const overlaysWithErrors = computed((): OverlayWithError[] => {
      return overlays.value.map(overlay => {
        const { annotationId } = overlay
        const annotation = props.view.annotationManager.getAnnotation(annotationId)

        if (!annotation) {
          return {
            ...overlay,
            error: true
          }
        }

        const threshold = typeThresholds.value[annotation.type] || 0
        const avgMatch = annotation.iouMatches
          ? annotation.iouMatches.reduce((a, b) => a + b[2], 0) / annotation.iouMatches.length
          : 1
        const error = avgMatch < threshold
        return {
          ...overlay,
          error
        }
      })
    })

    /**
     * Discards annotations that shouldn't be rendered in overlay
     *
     * - auto_annotate if polygon wasn't created with auto_annotate
     * - measures always
     */
    const filterSubAnnotations = (overlayData: AnnotationOverlayData): AnnotationType[] => {
      const { annotationId, subAnnotationTypes } = overlayData

      return subAnnotationTypes.filter(type => {
        if (type.name === 'auto_annotate') {
          return !!retrieveAutoAnnotateData(annotationId, props.view)
        }

        if (type.name === 'measures') { return false }

        if (type.name === 'inference') { return false }

        return true
      })
    }

    onBeforeUnmount(() => {
      view.value.camera.off(Camera.OFFSET_CHANGED, onOffsetChanged)
    })

    return {
      showSubAnnotations,
      overlaysWithErrors,
      filterSubAnnotations,
      rootStyle
    }
  }
})
</script>
