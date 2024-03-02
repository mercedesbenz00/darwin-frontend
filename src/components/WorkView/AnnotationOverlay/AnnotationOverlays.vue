<template>
  <div v-if="showSubAnnotations">
    <annotation-overlay
      v-for="overlay in overlaysWithErrors"
      :key="overlay.id"
      :view="view"
      :x="overlay.x"
      :y="overlay.y"
      :label="overlay.label"
      :annotation="overlay.annotation"
      :sub-annotation-types="filterSubAnnotations(overlay)"
      :overlays="overlay.overlays"
      :error="overlay.error"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { AnnotationOverlayData, View } from '@/engine/models'
import { retrieveAutoAnnotateData } from '@/engine/plugins/click/utils'
import { AnnotationType } from '@/engineCommon/AnnotationType'
import {
  DatasetItemPayload,
  RootState,
  StageType,
  TestStageTemplatePayload,
  WorkflowStagePayload
} from '@/store/types'

import AnnotationOverlay from './AnnotationOverlay.vue'

type OverlayWithError = AnnotationOverlayData & { error: boolean }

@Component({
  name: 'annotation-overlays',
  components: { AnnotationOverlay }
})
export default class AnnotationOverlays extends Vue {
  @State((state: RootState) => state.workview.renderSubAnnotations)
  showSubAnnotations!: boolean

  @Prop({ required: true, type: Object })
  view!: View;

  get overlays (): AnnotationOverlayData[] {
    return Object.values(this.view.overlayManager.annotationOverlayDataEntries)
  }

  @State((state: RootState) => state.workview.selectedDatasetItem)
  item!: DatasetItemPayload | null

  @State((state: RootState) => state.workview.selectedStageInstance)
  stage!: WorkflowStagePayload | null

  /**
   * Returns relevant test stage type thresholds. Only valid when currently
   * rendering annotations in review stage of a blind workflow, that directly
   * follows a test stage.
   */
  get typeThresholds (): TestStageTemplatePayload['metadata']['type_thresholds'] {
    const { item, stage } = this
    if (!item || !stage) { return {} }
    if (!item.current_workflow) { return {} }
    if (stage.type !== StageType.Review) { return {} }
    const { number } = stage
    const previousStage = item.current_workflow.stages[number - 1]?.[0]
    if (previousStage?.type !== StageType.Test) { return {} }
    return previousStage.template_metadata.type_thresholds
  }

  /**
   * Same as `overlays`, but with an additional `error` key, which is `true` if
   * - this is a review stage that directly follows a blind workflow test stage
   * - the annotation IOU is bellow appropriate threshold
   */
  get overlaysWithErrors (): OverlayWithError[] {
    return this.overlays.map(overlay => {
      const { annotation } = overlay
      const threshold = this.typeThresholds[annotation.type] || 0
      const avgMatch = annotation.iouMatches
        ? annotation.iouMatches.reduce((a, b) => a + b[2], 0) / annotation.iouMatches.length
        : 1
      const error = avgMatch < threshold
      return { ...overlay, error }
    })
  }

  /**
   * Discards annotations that shouldn't be rendered in overlay
   *
   * - auto_annotate if polygon wasn't created with auto_annotate
   * - measures always
   */
  filterSubAnnotations (overlayData: AnnotationOverlayData): AnnotationType[] {
    const { annotation, subAnnotationTypes } = overlayData

    return subAnnotationTypes.filter(type => {
      if (type.name === 'auto_annotate') {
        return !!retrieveAutoAnnotateData(annotation, this.view)
      }

      if (type.name === 'measures') { return false }

      if (type.name === 'inference') { return false }

      return true
    })
  }
}
</script>
