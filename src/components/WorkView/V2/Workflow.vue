<template>
  <workview
    ref="workview"
    class="workview"
    :editor="editor"
    :hotkeys="hotkeys"
  >
    <template #top>
      <workflow-top-bar
        :editor="editor"
        @add-class="showClassDialog"
      />
    </template>
    <template #left>
      <tool-bar
        class="workview__toolbar"
        :editor="editor"
      />
    </template>
    <template #right>
      <div class="workview__center__right-container">
        <workflow-layer-bar
          class="workview__center__layerbar"
          :readonly="readOnly"
          @modify-annotation="modifyAnnotation"
          @remove-annotation="removeAnnotation"
        />
        <tag-applier
          v-if="dataset"
          class="workview__center__tag-applier"
          :disabled="isCompleteStage"
          :parent-height="rightBarSize.height"
        />
        <resize-observer
          emit-on-mount
          @notify="rightBarSize = $event"
        />
      </div>
    </template>
    <template #sticky-bars>
      <video-annotations
        v-if="showVideoTool"
        :editor="editor"
      />
    </template>
    <template #bottom>
      <workflow-bottom-bar
        v-if="dataset"
        :dataset="dataset"
      />
    </template>
    <template #main>
      <stage-overlay class="workview__overlay" />
      <tool-option-overlay class="workview__tool-option-overlay" />
    </template>
    <class-selection
      :editor="editor"
      @add-class="showClassDialog"
    />
    <v2-workflow-item-channel-subscriber />
    <workflow-loader />
    <trained-models-loader />
    <models-loader />
    <workflow-instructions-trigger />
  </workview>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeMount,
  onBeforeUnmount,
  Ref,
  ref,
  watch
} from 'vue'
import { ResizeObserver } from 'vue-resize'

import WorkflowLoader from '@/components/Renderless/WorkflowLoader'
import { WorkflowBottomBar } from '@/components/WorkView/BottomBar/WorkflowBottomBar/V2'
import ClassSelection from '@/components/WorkView/ClassSelection/V2/ClassSelection.vue'
import {
  WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
  ANNOTATION_TOOL_HOTKEYS,
  WORKFLOW_REVIEW_GENERAL_HOTKEYS,
  REVIEW_TOOL_HOTKEYS,
  OPEN_DATASET_GENERAL_HOTKEYS,
  OPEN_DATASET_TOOL_HOTKEYS,
  WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
  COMPLETE_TOOL_HOTKEYS
} from '@/components/WorkView/HotkeyInfo/hotkeys'
import { HotkeyCategory } from '@/components/WorkView/HotkeyInfo/types'
import WorkflowLayerBar from '@/components/WorkView/LayerBar/WorkflowLayerBar/V2'
import ModelsLoader from '@/components/WorkView/Renderless/ModelsLoader'
import TrainedModelsLoader from '@/components/WorkView/Renderless/TrainedModelsLoader'
import V2WorkflowItemChannelSubscriber from '@/components/WorkView/Renderless/V2WorkflowItemChannelSubscriber'
import WorkflowInstructionsTrigger from '@/components/WorkView/Renderless/WorkflowInstructionsTrigger'
import { TagApplier } from '@/components/WorkView/TagApplier/V2'
import ToolBar from '@/components/WorkView/ToolBar/V2/ToolBar.vue'
import ToolOptionOverlay from '@/components/WorkView/ToolOptionOverlay.vue'
import { WorkflowTopBar } from '@/components/WorkView/TopBar/V2'
import StageOverlay from '@/components/WorkView/V2/StageOverlay.vue'
import Workview from '@/components/WorkView/V2/Workview.vue'
import VideoAnnotations from '@/components/WorkView/VideoScrubber/V2/VideoAnnotations.vue'
import { useStore, useSelectedDatasetItemV2 } from '@/composables'
import { useEditorV2, useActiveView, useConnectStore } from '@/composables/useEditorV2'
import { changeAnnotationClass } from '@/engineV2/actions'
import { LayoutConfig, ViewConfig } from '@/engineV2/layout'
import { View } from '@/engineV2/views'
import { StageAnnotation } from '@/store/modules/workview/types'
import { StageType } from '@/store/types'
import { getDatasetClasses } from '@/utils'

import {
  useStageAnnotationLoader,
  useTimeSummaryLoader,
  useWorkflowPlugins,
  useWorkflowLoader
} from './composables'

export default defineComponent({
  name: 'V2Workflow',
  components: {
    ClassSelection,
    ModelsLoader,
    ResizeObserver,
    VideoAnnotations,
    StageOverlay,
    TagApplier,
    ToolBar,
    ToolOptionOverlay,
    TrainedModelsLoader,
    WorkflowLoader,
    V2WorkflowItemChannelSubscriber,
    WorkflowInstructionsTrigger,
    WorkflowLayerBar,
    WorkflowTopBar,
    WorkflowBottomBar,
    Workview
  },
  setup () {
    const store = useStore()
    const dataset = computed(() => store.state.workview.dataset)

    const stageInstanceV2 = computed(() => store.state.workview.v2SelectedStageInstance)
    const selectedDatasetItem = useSelectedDatasetItemV2()
    const classes = computed(() => store.state.aclass.classes)

    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const readOnly = ref(false)

    // NOTE: We can do a different store connection in 2.0, or potentially not do it at all
    const disconnect = useConnectStore(store)
    onBeforeUnmount(() => { disconnect })

    const activeView = useActiveView()

    useTimeSummaryLoader()
    useWorkflowPlugins(editor.value)
    useWorkflowLoader()
    useStageAnnotationLoader()

    const rightBarSize: Ref<{ height: number, width: number }> = ref({ height: 0, width: 0 })

    const onClasses = (): void => {
      const classesToSet = dataset.value ? getDatasetClasses(classes.value, dataset.value.id) : []
      editor.value.viewsList.forEach(view => {
        view.annotationManager.setAnnotationClasses(classesToSet)
      })
    }

    const showVideoTool = ref(false)

    watch(stageInstanceV2, (value) => {
      if (value && ('readonly' in value.stage?.config)) {
        editor.value.layout.setAllViewsReadonlyState(value.stage.config.readonly)
        readOnly.value = value.stage.config.readonly
        return
      }

      // If no stage instance set all views as readonlyk
      editor.value.layout.setAllViewsReadonlyState(!value)
      readOnly.value = false
    }, { immediate: true })

    const handleShowFramesTool = (showFramesTool: boolean): void => {
      showVideoTool.value = showFramesTool
    }

    watch(() => activeView.value, (view: View) => {
      const types = editor.value.toolManager.currentAnnotationTypes()
      store.commit('workview/SET_TOOL_ANNOTATION_TYPES', types)
      handleShowFramesTool(view.showFramesTool)
    }, { immediate: true })

    const layout = computed((): LayoutConfig => {
      const { slots, layout } = selectedDatasetItem.value

      const views = [...slots]
        .sort((a, b) => {
          const indexA = layout?.slots?.indexOf(a.slot_name) || 0
          const indexB = layout?.slots?.indexOf(b.slot_name) || 0
          return indexA - indexB
        })
        .map(file => ({
          file,
          item: selectedDatasetItem.value
        } as ViewConfig))

      return {
        type: layout?.type || 'simple',
        views
      }
    })

    onBeforeMount(() => {
      const handleItemChanged = (): void => {
        editor.value.init(layout.value)
      }
      handleItemChanged()
      editor.value.itemManager.on('item:changed', handleItemChanged)
      onBeforeUnmount(() => {
        editor.value.itemManager.off('item:changed', handleItemChanged)
      })

      const handleLayoutChange = (): void => {
        onClasses()

        editor.value.layout.setAllViewsReadonlyState(!stageInstanceV2.value)
      }
      handleLayoutChange()
      editor.value.on('layout:changed', handleLayoutChange)
      onBeforeUnmount(() => {
        editor.value.off('layout:changed', handleLayoutChange)
      })

      editor.value.on('showFramesTool:changed', handleShowFramesTool)
    })

    // it's an array we push into when creating new classes,
    // so we need to watch for pushes into it, which needs { deep: true }
    watch(() => classes.value, () => onClasses(), { deep: true })

    const removeAnnotation = (annotation: StageAnnotation): void => {
      activeView.value.annotationManager.deleteAnnotationAction(annotation)
    }

    const modifyAnnotation = async (item: StageAnnotation): Promise<void> => {
      const annotation = activeView.value.annotationManager?.getAnnotation(item.id)
      if (!annotation) { return }

      const annotationClass = await editor.value.classDialog
        .requestUserSelectClass(annotation.type, annotation.classId)

      if (!annotationClass) { return }

      editor.value.actionManager.do(
        changeAnnotationClass(
          activeView.value.annotationManager,
          annotation,
          annotationClass
        )
      )
    }

    const workview: Ref<{ showClassDialog: () => void } | null> = ref(null)
    const showClassDialog = (): void => {
      workview.value?.showClassDialog()
    }

    const isCompleteStage =
      computed<boolean>(() =>
        !!stageInstanceV2.value && stageInstanceV2.value.stage.type === StageType.Complete
      )

    const hotkeys = computed<HotkeyCategory[]>(() => {
      if (
        !stageInstanceV2.value ||
        stageInstanceV2.value.stage?.type === StageType.Dataset
      ) {
        return [OPEN_DATASET_GENERAL_HOTKEYS, OPEN_DATASET_TOOL_HOTKEYS]
      }

      if (stageInstanceV2.value.stage?.type === StageType.Annotate) {
        return [
          WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
          WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
          ANNOTATION_TOOL_HOTKEYS
        ]
      }

      if (
        stageInstanceV2.value.stage?.type === StageType.Review &&
        !stageInstanceV2.value.stage?.config.readonly
      ) {
        return [
          WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
          WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
          ANNOTATION_TOOL_HOTKEYS
        ]
      }

      if (stageInstanceV2.value.stage.type === StageType.Review) {
        return [
          WORKFLOW_REVIEW_GENERAL_HOTKEYS,
          WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
          REVIEW_TOOL_HOTKEYS
        ]
      }

      if (selectedDatasetItem.value?.status === 'complete') {
        return [OPEN_DATASET_GENERAL_HOTKEYS, COMPLETE_TOOL_HOTKEYS]
      }

      return []
    })

    const tutorialMode = computed(() => store.state.workview.tutorialMode)

    onBeforeUnmount(() => {
      editor.value.off('showFramesTool:changed', handleShowFramesTool)
      store.commit('workview/CLEAR_LOADED_VIDEO')
      editor.value.cleanup()
    })

    return {
      workview,
      rightBarSize,
      dataset,
      editor,
      activeView,
      hotkeys,
      isCompleteStage,
      layout,
      readOnly,
      modifyAnnotation,
      removeAnnotation,
      showClassDialog,
      showVideoTool,
      tutorialMode
    }
  }
})

</script>

<style lang="scss" scoped>
.workview__overlay {
  z-index: var(--workview-overlay);
}

.workview__tool-option-overlay {
  z-index: var(--workview-tool-option-overlay);
}

.workview__center__right-container {
  width: 100%;
  height: 100%;
  @include col;
}

.workview__center__layerbar {
  width: 100%;
  flex: 1;
  overflow: hidden;
}

.workview__center__tag-applier {
  height: auto;
}
</style>
