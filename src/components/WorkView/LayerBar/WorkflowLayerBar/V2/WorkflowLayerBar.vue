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
      v-if="viewsList.length > 1 || stageAnnotations.length > 0"
      #default
    >
      <workflow-layer-bar-expansion-panels
        :views-stage-annotations="viewsStageAnnotations"
        :class="{ wrapper: viewsList.length === 1 }"
      >
        <template #content="{ view, viewsStageAnnotations }">
          <template v-if="viewsList.length === 1">
            <virtual-draggable-list
              ref="virtualList"
              class="workflow-layer-bar__layers"
              key-field="id"
              :items="viewsStageAnnotations"
              :disabled="!canAnnotate"
              @change="onDragChange"
            >
              <template #default="{ item }">
                <layer-bar-item
                  :annotation="item"
                  :readonly="readonly"
                  @mousedown="setActiveView(view)"
                  @modify="$emit('modify-annotation', item)"
                  @remove="$emit('remove-annotation', item)"
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
                v-for="annotation in viewsStageAnnotations"
                :key="annotation.id"
                :annotation="annotation"
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
  onBeforeUnmount,
  watch,
} from 'vue'
import { ChangeEvent } from 'vuedraggable'

import AnimatingDraggable from '@/components/Common/AnimatingDraggable.vue'
import {
  VirtualDraggableChange,
  VirtualDraggableList
} from '@/components/Common/VirtualDraggableList'
import AnnotationControl from '@/components/WorkView/LayerBar/AnnotationControl/V2/AnnotationControl.vue'
import LayerBar from '@/components/WorkView/LayerBar/LayerBar.vue'
import LayerBarItem from '@/components/WorkView/LayerBar/LayerBarItem/V2/LayerBarItem.vue'
import CopyStageAnnotations from '@/components/WorkView/LayerBar/WorkflowLayerBar/V2/CopyStageAnnotations.vue'
import AnnotationToggle from '@/components/WorkView/TopBar/components/AnnotationToggle.vue'
import MeasureToggle from '@/components/WorkView/TopBar/components/MeasureToggle.vue'
import SubAnnotationToggle from '@/components/WorkView/TopBar/components/SubAnnotationToggle.vue'
import { useStore } from '@/composables'
import { useActiveView } from '@/composables/useEditorV2/useActiveView'
import { useEditorLayout } from '@/composables/useEditorV2/useLayout'
import { useViewReadonly } from '@/composables/useEditorV2/useViewReadonly'
import { View } from '@/engineV2/views'
import { useCommentStore } from '@/pinia/useCommentStore'
import { StageAnnotation } from '@/store/modules/workview/types'

import WorkflowLayerBarExpansionPanels from './WorkflowLayerBarExpansionPanels.vue'

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
    readonly: { required: false, default: false, type: Boolean }
  },
  setup () {
    const activeView = useActiveView()
    const isViewReadonly = useViewReadonly(activeView)
    const layout = useEditorLayout()
    const commentStore = useCommentStore()

    const store = useStore()
    const { state, dispatch } = store

    const virtualList: Ref<VirtualDraggableList | undefined> = ref()

    const getStageAnnotations = (view: View): StageAnnotation[] => {
      return view.annotationManager.frameAnnotations.map(({ id }) =>
        state.workview.stageAnnotations.find(a => a.id === id)
      ).filter(a => !!a?.id) as StageAnnotation[]
    }

    const onDragChange = (event: VirtualDraggableChange<StageAnnotation> | null): void => {
      if (!event) { return }

      const annotation = activeView.value
        .annotationManager
        .getAnnotation(event.oldItem.id)

      const newAnnotation = annotation?.shallowClone({
        zIndex: event.newItem.z_index
      })

      if (!newAnnotation) { return }

      activeView.value.annotationManager.updateAnnotation(newAnnotation)
    }

    const viewsList = computed(() => layout.value.viewsList)

    const viewsStageAnnotations = computed<{
      viewsStageAnnotations: StageAnnotation[],
      view: View
    }[]>(() => {
      return viewsList.value.map(view => ({
        viewsStageAnnotations: getStageAnnotations(view),
        view
      }))
    })

    const stageAnnotations = computed<StageAnnotation[]>(() =>
      store.state.workview.stageAnnotations
    )

    watch(() => stageAnnotations.value, (newValue) => {
      const annotationsById = Object.fromEntries(newValue.map(a => [a.id, a]))
      commentStore.threads
        .filter(t =>
          // just conflicts of more than one annotation
          (t.issue_data?.annotation_ids.length ?? 0) > 1
        )
        .filter(t =>
          t.issue_data?.annotation_ids.filter(aid => !!annotationsById[aid]).length === 1
          && !t.resolved
        ).forEach(t => {
          commentStore.resolveCommentThread(t.id)
        })
    })

    const selectedStageAnnotationIndex = computed((): number => {
      return stageAnnotations.value.findIndex(annotation => annotation.isSelected)
    })

    const selectedStageAnnotation = computed((): StageAnnotation => {
      return stageAnnotations.value[selectedStageAnnotationIndex.value]
    })

    const canAnnotate = computed((): boolean =>
      !isViewReadonly.value
    )

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

    const onDragChangeOld = (event: ChangeEvent<HTMLLIElement>): void => {
      if (!event.moved) { return }
      const annotation = stageAnnotations.value[event.moved.oldIndex]
      const newAnnotation = stageAnnotations.value[event.moved.newIndex]
      const params = { annotation, zIndex: newAnnotation.z_index }
      dispatch('workview/updateStageAnnotationZIndex', params)
    }

    const setActiveView = (view: View): void => {
      layout.value.setActiveView(view)
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
      activeView,
      viewsList,
      virtualList,
      viewsStageAnnotations,
      onDragChange,
      onDragChangeOld,
      draggableModel,
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
