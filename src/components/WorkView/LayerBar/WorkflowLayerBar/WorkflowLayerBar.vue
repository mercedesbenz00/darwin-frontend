<template>
  <layer-bar
    :editable="canAnnotate"
    @move-up="onMoveUp"
    @move-down="onMoveDown"
    @move-top="onMoveTop"
    @move-bottom="onMoveBottom"
  >
    <template #header>
      <sub-annotation-toggle />
      <annotation-toggle />
      <measure-toggle />
      <annotation-control />
    </template>
    <template
      v-if="editor.viewsList.length > 1 || stageAnnotations.length > 0"
      #default
    >
      <workflow-layer-bar-expansion-panels
        :editor="editor"
        :views-stage-annotations="viewsStageAnnotations"
        :class="{ wrapper: editor.viewsList.length === 1 }"
      >
        <template #content="{ view, stageAnnotations }">
          <template v-if="editor.viewsList.length === 1">
            <virtual-draggable-list
              ref="virtualList"
              class="workflow-layer-bar__layers"
              key-field="id"
              :items="annotationsWithClasses(view)"
              :disabled="!canAnnotate"
              @change="onDragChange"
            >
              <template #default="{ item }">
                <layer-bar-item
                  :annotation="item.annotation"
                  :annotations="stageAnnotations"
                  :annotation-class="item.annotationClass"
                  :editor="editor"
                  :readonly="readonly"
                  @mousedown="setActiveView(view)"
                  @modify="$emit('modify-annotation', item.annotation)"
                  @remove="$emit('remove-annotation', item.annotation)"
                />
              </template>
            </virtual-draggable-list>
          </template>
          <template v-else>
            <animating-draggable
              v-model="draggableModel"
              class="workflow-layer-bar__layers"
              :disabled="!canAnnotate"
              @change="onDragChangeOld"
            >
              <layer-bar-item
                v-for="{annotation, annotationClass} in annotationsWithClasses(view)"
                :key="annotation.id"
                :annotation="annotation"
                :annotation-class="annotationClass"
                :annotations="stageAnnotations"
                :editor="editor"
                :readonly="readonly"
                @mousedown="setActiveView(view)"
                @modify="$emit('modify-annotation', annotation)"
                @remove="$emit('remove-annotation', annotation)"
              />
            </animating-draggable>
          </template>
        </template>
      </workflow-layer-bar-expansion-panels>
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
import {
  Ref,
  ref,
  defineComponent,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue'
import { ChangeEvent } from 'vuedraggable'

import AnimatingDraggable from '@/components/Common/AnimatingDraggable.vue'
import {
  VirtualDraggableChange,
  VirtualDraggableList
} from '@/components/Common/VirtualDraggableList'
import AnnotationControl from '@/components/WorkView/LayerBar/AnnotationControl/AnnotationControl.vue'
import LayerBar from '@/components/WorkView/LayerBar/LayerBar.vue'
import LayerBarItem from '@/components/WorkView/LayerBar/LayerBarItem/LayerBarItem.vue'
import AnnotationToggle from '@/components/WorkView/TopBar/components/AnnotationToggle.vue'
import MeasureToggle from '@/components/WorkView/TopBar/components/MeasureToggle.vue'
import SubAnnotationToggle from '@/components/WorkView/TopBar/components/SubAnnotationToggle.vue'
import { useStore } from '@/composables'
import { Editor } from '@/engine/editor'
import { View } from '@/engine/models'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload, WorkflowStagePayload } from '@/store/types'

import CopyStageAnnotations from './CopyStageAnnotations.vue'
import WorkflowLayerBarExpansionPanels from './WorkflowLayerBarExpansionPanels.vue'

type AnnotationWithClass = {
  id: string,
  annotation: StageAnnotation,
  annotationClass: AnnotationClassPayload
}

export default defineComponent({
  name: 'WorkflowLayerBar',
  components: {
    VirtualDraggableList,
    AnimatingDraggable,
    AnnotationControl,
    AnnotationToggle,
    CopyStageAnnotations,
    LayerBar,
    LayerBarItem,
    MeasureToggle,
    SubAnnotationToggle,
    WorkflowLayerBarExpansionPanels
  },
  props: {
    editor: {
      required: true,
      type: Object as () => Editor
    },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const store = useStore()
    const { state, getters, dispatch } = store

    const datasetItem = computed(() => state.workview.selectedDatasetItem)
    const stageInstance = computed(() => state.workview.selectedStageInstance)
    const v2StageInstance = computed(() => state.workview.v2SelectedStageInstance)
    const classesById = computed(() => state.aclass.classesById)
    const annotationClasses = computed(() => state.aclass.classes)
    const isVersion2 = computed<boolean>((): boolean => getters['dataset/isVersion2'])

    const byStage:
      (
        stage: WorkflowStagePayload,
        wf2: boolean,
        currentFrameIndex?: number
      ) => StageAnnotation[] = getters['workview/sortedInferredAnnotationsByStage']

    const virtualList: Ref<VirtualDraggableList | undefined> = ref()

    const relevantAnnotations = (frameIndex?: number): StageAnnotation[] =>
      byStage(stageInstance.value as WorkflowStagePayload, isVersion2.value, frameIndex)

    const loadAnnotationsIfStageInstanceExists = (frameIndex?: number): StageAnnotation[] => {
      if (isVersion2.value) {
        return v2StageInstance.value ? relevantAnnotations(frameIndex) : []
      }
      return stageInstance.value ? relevantAnnotations(frameIndex) : []
    }

    const onDragChange = (event: VirtualDraggableChange<AnnotationWithClass> | null): void => {
      if (!event) { return }

      const annotation = event.oldItem.annotation
      const newAnnotation = event.newItem.annotation
      const params = { annotation, zIndex: newAnnotation.z_index }
      dispatch('workview/updateStageAnnotationZIndex', params)
    }

    const viewsStageAnnotations = computed(
      (): { stageAnnotations: StageAnnotation[], view: View }[] => {
        return props.editor.viewsList.map(view => ({
          stageAnnotations: loadAnnotationsIfStageInstanceExists(view.currentFrameIndex),
          view
        }))
      }
    )

    const stageAnnotations = computed((): StageAnnotation[] => {
      const { loadedVideo } = props.editor.activeView

      const loadedAnnotations = loadedVideo
        ? loadAnnotationsIfStageInstanceExists(props.editor.activeView.currentFrameIndex)
        : loadAnnotationsIfStageInstanceExists()

      const stringClassIds = annotationClasses.value
        .filter(annotationClass => annotationClass.annotation_types.includes('string'))
        .map(annotationClass => annotationClass.id)

      const result = loadedAnnotations.filter(annotation =>
        !stringClassIds.includes(annotation.annotation_class_id))

      return result
    })

    const selectedStageAnnotationIndex = computed((): number => {
      return stageAnnotations.value.findIndex(annotation => annotation.isSelected)
    })

    const selectedStageAnnotation = computed((): StageAnnotation => {
      return stageAnnotations.value[selectedStageAnnotationIndex.value]
    })

    const canAnnotate = computed((): boolean => {
      if (!datasetItem.value?.current_workflow || !stageInstance.value) { return false }
      const onCurrentStage = datasetItem.value
        .current_workflow
        .current_workflow_stage_template_id === stageInstance.value.workflow_stage_template_id

      return onCurrentStage && (
        (!('readonly' in stageInstance.value.template_metadata)) ||
        !stageInstance.value.template_metadata.readonly
      )
    })

    let unsubscribeStore: Function
    onMounted(() => {
      unsubscribeStore = store.subscribe(mutation => {
        switch (mutation.type) {
        case 'workview/SELECT_ANNOTATION': {
          if (virtualList.value) {
            virtualList.value.scrollTo(selectedStageAnnotationIndex.value)
          }
          break
        }
        }
      })
    })

    const annotationsWithClasses = (view: View): AnnotationWithClass[] => {
      return stageAnnotations.value
        .filter((annotation: StageAnnotation) => (view.isViewsAnnotation(annotation)))
        .map(annotation => ({
          id: annotation.id,
          annotation,
          annotationClass: classesById.value[annotation.annotation_class_id]
        }))
    }

    const onDragChangeOld = (event: ChangeEvent<HTMLLIElement>): void => {
      if (!event.moved) { return }
      const annotation = stageAnnotations.value[event.moved.oldIndex]
      const newAnnotation = stageAnnotations.value[event.moved.newIndex]
      const params = { annotation, zIndex: newAnnotation.z_index }
      dispatch('workview/updateStageAnnotationZIndex', params)
    }

    const setActiveView = (view: View): void => {
      props.editor.layout.setActiveView(view)
    }

    const onMoveUp = (): void => {
      if (!Number.isFinite(selectedStageAnnotation.value?.z_index)) { return }
      const prevAnnotationIndex = selectedStageAnnotationIndex.value - 1
      if (!stageAnnotations.value[prevAnnotationIndex]) { return }
      const prevAnnotation = stageAnnotations.value[prevAnnotationIndex]
      if (prevAnnotation.z_index === null) { return }

      dispatch('workview/updateStageAnnotationZIndex', {
        annotation: selectedStageAnnotation.value,
        zIndex: prevAnnotation.z_index
      })
    }

    const onMoveDown = (): void => {
      if (!Number.isFinite(selectedStageAnnotation.value?.z_index)) { return }
      const nextAnnotationIndex = selectedStageAnnotationIndex.value + 1
      if (!stageAnnotations.value[nextAnnotationIndex]) { return }
      const nextAnnotation = stageAnnotations.value[nextAnnotationIndex]
      if (nextAnnotation.z_index === null) { return }

      dispatch('workview/updateStageAnnotationZIndex', {
        annotation: selectedStageAnnotation.value,
        zIndex: nextAnnotation.z_index
      })
    }

    const onMoveBottom = (): void => {
      if (!Number.isFinite(selectedStageAnnotation.value?.z_index)) { return }
      const numbers: number[] = stageAnnotations.value
        .map(a => a.z_index)
        .filter(z => z !== null) as number[]

      if (!numbers.length) { return }

      const zIndex = Math.max(...numbers)

      dispatch('workview/updateStageAnnotationZIndex', {
        annotation: selectedStageAnnotation.value,
        zIndex
      })
    }

    const onMoveTop = (): void => {
      if (!Number.isFinite(selectedStageAnnotation.value?.z_index)) { return }
      const numbers: number[] = stageAnnotations.value
        .map(a => a.z_index)
        .filter(z => z !== null) as number[]

      if (!numbers.length) { return }

      const zIndex = Math.min(...numbers)

      dispatch('workview/updateStageAnnotationZIndex', {
        annotation: selectedStageAnnotation.value,
        zIndex
      })
    }

    onBeforeUnmount(() => {
      unsubscribeStore()
    })

    const draggableModel: Ref<StageAnnotation[]> = ref([])

    return {
      virtualList,
      viewsStageAnnotations,
      onDragChange,
      onDragChangeOld,
      draggableModel,
      annotationsWithClasses,
      setActiveView,
      onMoveUp,
      onMoveDown,
      onMoveBottom,
      onMoveTop,
      canAnnotate,
      stageAnnotations
    }
  }
})
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
}

.workflow-layer-bar__layers {
  max-height: 100%;
  margin: 0;
  padding: 0;

  @include hidden-scrollbar;
}

:deep(.layerbar__header) {
  padding-top: 0;
  padding-bottom: 0;
}
</style>
