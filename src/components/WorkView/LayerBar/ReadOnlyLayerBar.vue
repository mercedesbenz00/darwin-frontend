<template>
  <layer-bar :editable="false">
    <template #header>
      <sub-annotation-toggle />
      <annotation-toggle />
      <measure-toggle />
      <annotation-control readonly />
    </template>
    <template
      v-if="stageAnnotations.length > 0"
      #default
    >
      <div class="workflow-layer-bar__layers">
        <layer-bar-item
          v-for="{annotation, annotationClass} in annotationsWithClasses"
          :key="annotation.id"
          :annotation="annotation"
          :annotations="stageAnnotations"
          :annotation-class="annotationClass"
          :editor="editor"
          readonly
        />
      </div>
    </template>
    <template
      v-else
      #empty
    >
      <copy-stage-annotations :key="'empty'" />
    </template>
  </layer-bar>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { Getter, State } from 'vuex-class'

import AnimatingDraggable from '@/components/Common/AnimatingDraggable.vue'
import { CircleSpinner } from '@/components/Common/LoadingIndicators'
import AnnotationToggle from '@/components/WorkView/TopBar/components/AnnotationToggle.vue'
import MeasureToggle from '@/components/WorkView/TopBar/components/MeasureToggle.vue'
import SubAnnotationToggle from '@/components/WorkView/TopBar/components/SubAnnotationToggle.vue'
import { Editor } from '@/engine/editor'
import { StageAnnotation } from '@/store/modules/workview/types'
import {
  AnnotationClassPayload,
  DatasetItemPayload,
  RootState,
  WorkflowStagePayload
} from '@/store/types'

import AnnotationControl from './AnnotationControl/AnnotationControl.vue'
import LayerBar from './LayerBar.vue'
import LayerBarItem from './LayerBarItem/LayerBarItem.vue'
import CopyStageAnnotations from './WorkflowLayerBar/CopyStageAnnotations.vue'

@Component({
  name: 'read-only-layer-bar',
  components: {
    AnimatingDraggable,
    AnnotationControl,
    AnnotationToggle,
    CopyStageAnnotations,
    MeasureToggle,
    LayerBar,
    LayerBarItem,
    CircleSpinner,
    SubAnnotationToggle
  }
})
export default class ReadOnlyLayerBar extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @State((state: RootState) => state.workview.selectedDatasetItem)
  datasetItem!: DatasetItemPayload | null

  @State((state: RootState) => state.workview.selectedStageInstance)
  stageInstance!: WorkflowStagePayload

  @Getter('nonTagSortedAnnotationsByStage', { namespace: 'workview' })
  byStage!: (stage: WorkflowStagePayload) => StageAnnotation[]

  get stageAnnotations (): StageAnnotation[] {
    return this.stageInstance ? this.byStage(this.stageInstance) : []
  }

  @State((state: RootState) => state.aclass.classesById)
  classesById!: AnnotationClassPayload[]

  get annotationsWithClasses (): {
    annotation: StageAnnotation,
    annotationClass: AnnotationClassPayload
  }[] {
    return this.stageAnnotations.map(annotation => ({
      annotation,
      annotationClass: this.classesById[annotation.annotation_class_id]
    }))
  }

  get selectedStageAnnotation (): StageAnnotation | undefined {
    return this.stageAnnotations.find(annotation => annotation.isSelected)
  }
}
</script>

<style lang="scss" scoped>
.workflow-layer-bar__layers {
  margin: 0;
  padding: 0;

  @include hidden-scrollbar;
}

.copy__description {
  padding: 0 20px 30px;
  @include typography(md, default, 500);
  color: $colorGrayLite;
}

.copy__spinner {
  margin: -100px;
}

:deep(.layerbar__header) {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
