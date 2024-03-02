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
          :editor="editor"
          :readonly="isReadOnly"
          @modify-annotation="modifyAnnotation"
          @remove-annotation="removeAnnotation"
        />
        <tag-applier
          v-if="dataset"
          class="workview__center__tag-applier"
          :editor="editor"
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
      <v2-workflow-bottom-bar v-if="is20" />
      <workflow-bottom-bar v-else />
    </template>
    <template #main>
      <stage-overlay class="workview__overlay" />
      <tool-option-overlay class="workview__tool-option-overlay" />
    </template>
    <class-selection
      :editor="editor"
      @add-class="showClassDialog"
    />
    <workflow-plugin-manager :editor="editor" />
    <item-count-loader v-if="!is20" />
    <items-loader v-if="!is20" />
    <default-workflow-loader />
    <stage-annotation-loader v-if="!is20" />
    <v2-workflow-item-channel-subscriber v-if="is20" />
    <stage-selector />
    <comment-loader />
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

import { WorkflowBottomBar, V2WorkflowBottomBar } from '@/components/WorkView/BottomBar'
import StageOverlay from '@/components/WorkView/StageOverlay.vue'
import ToolOptionOverlay from '@/components/WorkView/ToolOptionOverlay.vue'
import { useStore, useTimeSummaryLoader } from '@/composables'
import { changeAnnotationClass } from '@/engine/actions'
import { connectStore } from '@/engine/connectStore'
import { LayoutConfig } from '@/engine/models/layout'
import { useEditor } from '@/engine/useEditor'
import { StageAnnotation } from '@/store/modules/workview/types'
import { StageType } from '@/store/types'
import { getDatasetClasses } from '@/utils'

import ClassSelection from './ClassSelection/ClassSelection.vue'
import {
  WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
  ANNOTATION_TOOL_HOTKEYS,
  WORKFLOW_REVIEW_GENERAL_HOTKEYS,
  REVIEW_TOOL_HOTKEYS,
  OPEN_DATASET_GENERAL_HOTKEYS,
  OPEN_DATASET_TOOL_HOTKEYS,
  WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
  COMPLETE_TOOL_HOTKEYS
} from './HotkeyInfo/hotkeys'
import { HotkeyCategory } from './HotkeyInfo/types'
import WorkflowLayerBar from './LayerBar/WorkflowLayerBar'
import CommentLoader from './Renderless/CommentLoader'
import DefaultWorkflowLoader from './Renderless/DefaultWorkflowLoader'
import ItemCountLoader from './Renderless/ItemCountLoader'
import ItemsLoader from './Renderless/ItemsLoader'
import ModelsLoader from './Renderless/ModelsLoader'
import StageAnnotationLoader from './Renderless/StageAnnotationLoader'
import StageSelector from './Renderless/StageSelector'
import TrainedModelsLoader from './Renderless/TrainedModelsLoader'
import V2WorkflowItemChannelSubscriber from './Renderless/V2WorkflowItemChannelSubscriber'
import WorkflowInstructionsTrigger from './Renderless/WorkflowInstructionsTrigger'
import WorkflowPluginManager from './Renderless/WorkflowPluginManager'
import { TagApplier } from './TagApplier/V1'
import ToolBar from './ToolBar/ToolBar.vue'
import WorkflowTopBar from './TopBar/WorkflowTopBar.vue'
import VideoAnnotations from './VideoScrubber/VideoAnnotations.vue'
import Workview from './Workview.vue'

export default defineComponent({
  name: 'Workflow',
  components: {
    ClassSelection,
    CommentLoader,
    DefaultWorkflowLoader,
    ItemCountLoader,
    ItemsLoader,
    ModelsLoader,
    ResizeObserver,
    StageAnnotationLoader,
    StageOverlay,
    StageSelector,
    TagApplier,
    ToolBar,
    ToolOptionOverlay,
    TrainedModelsLoader,
    V2WorkflowItemChannelSubscriber,
    VideoAnnotations,
    WorkflowBottomBar,
    V2WorkflowBottomBar,
    WorkflowInstructionsTrigger,
    WorkflowLayerBar,
    WorkflowPluginManager,
    WorkflowTopBar,
    Workview
  },
  setup () {
    const store = useStore()
    const dataset = computed(() => store.state.workview.dataset)

    const stage = computed(() => store.state.workview.selectedStageInstance)
    const selectedDatasetItem = computed(() => store.state.workview.selectedDatasetItem)
    const classes = computed(() => store.state.aclass.classes)

    const { resolveEditor } = useEditor()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }

    const rightBarSize: Ref<{ height: number, width: number }> = ref({ height: 0, width: 0 })

    useTimeSummaryLoader()

    onBeforeMount(() => {
      editor.value.init()
      // NOTE: We can do a different store connection in 2.0, or potentially not do it at all
      const disconnect = connectStore(store, editor.value)
      onBeforeUnmount(() => disconnect())
    })

    const layout = computed<LayoutConfig>(() => {
      const layout = selectedDatasetItem.value?.dataset_video?.metadata.layout
      if (!layout) {
        return {
          type: 'single',
          views: [{
            item: selectedDatasetItem.value
          }]
        }
      }

      return {
        type: layout.name,
        views: layout.groups.map(i => ({
          item: selectedDatasetItem.value,
          framesGroup: i
        }))
      }
    })

    const onClasses = (): void => {
      const classesToSet = dataset.value ? getDatasetClasses(classes.value, dataset.value.id) : []
      editor.value.viewsList.forEach(view => {
        view.setAnnotationClasses(classesToSet)
      })
    }

    watch(
      () => editor.value.viewsList,
      () => { onClasses() },
      { immediate: true }
    )

    // it's an array we push into when creating new classes, 
    // so we need to watch for pushes into it, which needs { deep: true }
    watch(() => classes.value, () => onClasses(), { deep: true })

    watch(() => layout.value, () => {
      if (!editor.value.layout.isSameLayoutConfig(layout.value)) {
        editor.value.setupLayout(layout.value)
      }
    }, { deep: true })

    const removeAnnotation = (annotation: StageAnnotation): void => {
      editor.value.activeView.removeAnnotation(annotation)
    }

    const modifyAnnotation = async (item: StageAnnotation): Promise<void> => {
      const annotation = editor.value.activeView.annotations.find(a => a.id === item.id)
      if (!annotation) { return }

      const annotationClass = await editor.value.classDialog
        .requestUserSelectClass(annotation.type, annotation.classId)

      if (!annotationClass) { return }

      editor.value.actionManager.do(
        changeAnnotationClass(editor.value, annotation, annotationClass)
      )
    }

    const workview: Ref<{ showClassDialog: () => void } | null> = ref(null)
    const showClassDialog = (): void => {
      workview.value?.showClassDialog()
    }

    const isCompleteStage =
      computed<boolean>(() => !!stage.value && stage.value.type === StageType.Complete)

    const isReadOnly =
      computed<boolean>(() => !!stage.value && stage.value.type === StageType.Review
       && stage.value.template_metadata.readonly)

    const hotkeys = computed<HotkeyCategory[]>(() => {
      if (!stage.value) { return [OPEN_DATASET_GENERAL_HOTKEYS, OPEN_DATASET_TOOL_HOTKEYS] }

      if (stage.value.type === StageType.Annotate) {
        return [
          WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
          WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
          ANNOTATION_TOOL_HOTKEYS
        ]
      }

      if (stage.value.type === StageType.Review && !stage.value.template_metadata.readonly) {
        return [
          WORKFLOW_ANNOTATION_GENERAL_HOTKEYS,
          WORKFLOW_ANNOTATION_VIDEO_HOTKEYS,
          ANNOTATION_TOOL_HOTKEYS
        ]
      }

      if (stage.value.type === StageType.Review) {
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

    const showVideoTool = computed<boolean>(() => {
      const {
        loadedVideo,
        isDicomItem,
        isPdfItem,
        hasAllGroupsWithOneFrame
      } = editor.value?.activeView

      if (!loadedVideo) { return false }

      if (isDicomItem && hasAllGroupsWithOneFrame) {
        return false
      }

      /**
       * Hide video control if loadedVideo is dicom video and has only 1 frame
       */
      return !(isDicomItem || isPdfItem) || Object.keys(loadedVideo.frames).length > 1
    })

    const tutorialMode = computed(() => store.state.workview.tutorialMode)

    const is20 = computed<boolean>(() => dataset.value?.version === 2)

    onBeforeUnmount(() => {
      store.commit('workview/CLEAR_LOADED_VIDEO')
      editor.value.cleanup()
    })

    return {
      workview,
      rightBarSize,
      dataset,
      editor,
      hotkeys,
      is20,
      isCompleteStage,
      layout,
      isReadOnly,
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
