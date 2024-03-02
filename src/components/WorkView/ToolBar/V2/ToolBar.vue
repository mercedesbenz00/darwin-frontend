<template>
  <div class="workview__toolbar">
    <div class="workview__toolbar__top">
      <tool-bar-button
        v-for="entry in tools"
        :key="entry.name"
        :data="entry"
        :active="activeToolName === entry.name"
        @click="selectTool(entry)"
      />
    </div>

    <div class="workview__toolbar__bottom">
      <tool-bar-feedback-button />
      <tool-bar-zoom-controls
        :scale="scale"
        @scale-to-fit="scaleToFit"
      />
      <tool-bar-history-tools
        v-if="selectedDatasetItem"
        :can-undo="canUndo"
        :can-redo="canRedo"
        @undo="undo"
        @redo="redo"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ref, defineComponent, onMounted, onBeforeUnmount } from 'vue'

import {
  ToolBarFeedbackButton,
  ToolBarHistoryTools,
  ToolBarZoomControls
} from '@/components/WorkView/ToolBar'
import ToolBarButton from '@/components/WorkView/ToolBar/ToolBarButton/V2/ToolBarButton.vue'
import { useSelectedDatasetItemV2 } from '@/composables'
import { useCanRedo, useCanUndo } from '@/composables/useEditorV2'
import { Editor } from '@/engineV2/editor'
import { ToolInfo } from '@/engineV2/managers/toolManager'

export default defineComponent({
  name: 'V2ToolBar',
  components: {
    ToolBarButton,
    ToolBarFeedbackButton,
    ToolBarHistoryTools,
    ToolBarZoomControls
  },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (props) {
    const selectedDatasetItem = useSelectedDatasetItemV2()
    const canUndo = useCanUndo()
    const canRedo = useCanRedo()

    const tools = ref<ToolInfo[]>([])
    const activeToolName = ref<string>('')
    const scale = computed(() => props.editor.activeView.camera.scale)

    const scaleToFit = (): void => {
      props.editor.activeView.scaleToFit()
    }

    const selectTool = (tool: ToolInfo): void => {
      props.editor.activeView.toolManager.activateToolWithStore(tool.name)
    }

    const undo = (): void => {
      if (canUndo.value) { props.editor.actionManager.undo() }
    }

    const redo = (): void => {
      if (canRedo.value) { props.editor.actionManager.redo() }
    }

    onMounted(() => {
      const handleAvailableToolsChange = (availableTools: ToolInfo[]): void => {
        tools.value = availableTools
      }
      handleAvailableToolsChange(props.editor.toolManager.availableTools)
      props.editor.toolManager.on('availableTools:changed', handleAvailableToolsChange)
      onBeforeUnmount(() => {
        props.editor.toolManager.off('availableTools:changed', handleAvailableToolsChange)
      })

      const handleActiveTool = (name: string): void => {
        activeToolName.value = name
      }
      // handleActiveTool(toolManager.availableTools)
      props.editor.toolManager.on('tool:activated', handleActiveTool)
      onBeforeUnmount(() => {
        props.editor.toolManager.off('tool:activated', handleActiveTool)
      })
    })

    return {
      scale,
      tools,
      activeToolName,
      canUndo,
      canRedo,
      scaleToFit,
      selectTool,
      undo,
      redo,
      selectedDatasetItem
    }
  }
})
</script>

<style lang="scss" scoped>
$toolbarWidth: 44px;

.workview__toolbar {
  position: relative;
  @include col--distributed;
  gap: 4px;
  padding: 4px;
  height: 100%;
  width: $toolbarWidth;
  text-align: center;
  background-color: $colorNeutralsWhite;
  box-shadow: inset -1px 0px 0px $colorBorderLight;
  border-radius: 8px 0 0 8px;
  overflow: hidden;
  z-index: 1;

  &__top {
    @include col;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;

    @include hidden-scrollbar;
  }

  &__bottom {
    @include col;
    width: 100%;
  }

  // all buttons in the sidebar behave slightly differently than a normal
  // icon-button. (eg: the hover effect and focus one have different colors)
  &:deep(.icon-button) {
    &.toolbar__button,
    &.zoom-controls__button,
    &.history-tools__button {
      min-height: calc($toolbarWidth - 8px);
      min-width: calc($toolbarWidth - 8px);

      &:not(:last-child){
        margin-bottom: 4px;
      }

      &--active {
        background-color: rgba(35, 89, 251, 0.16);
      }

      &:hover {
        background-color: $colorOverlayHover;
      }
    }
  }
}
</style>
