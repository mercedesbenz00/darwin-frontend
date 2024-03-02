<template>
  <div class="workview__toolbar">
    <div class="workview__toolbar__top">
      <tool-bar-button
        v-for="entry in tools"
        :key="entry.name"
        :data="entry"
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
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import {
  ToolBarButton,
  ToolBarFeedbackButton,
  ToolBarHistoryTools,
  ToolBarZoomControls
} from '@/components/WorkView/ToolBar'
import { Editor } from '@/engine/editor'
import { ToolManager, ActionManager } from '@/engine/managers'
import { ToolInfo } from '@/engine/managers/toolManager'
import { DatasetItemPayload } from '@/store/types'

@Component({
  name: 'tool-bar',
  components: {
    ToolBarButton,
    ToolBarFeedbackButton,
    ToolBarHistoryTools,
    ToolBarZoomControls
  }
})
export default class ToolBar extends Vue {
  @Prop({ required: true })
  editor!: Editor;

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload | null

  get scale (): number {
    return this.editor.cameraScale
  }

  get toolManager (): ToolManager {
    const { editor } = this
    return editor.toolManager
  }

  get actionManager (): ActionManager {
    const { editor } = this
    return editor.actionManager
  }

  get tools (): ToolInfo[] {
    const { toolManager } = this
    return toolManager.availableTools
  }

  get canUndo (): boolean {
    const { actionManager } = this
    return actionManager.canUndo
  }

  get canRedo (): boolean {
    const { actionManager } = this
    return actionManager.canRedo
  }

  scaleToFit (): void {
    this.editor.scaleToFit()
  }

  selectTool (tool: ToolInfo): void {
    this.editor.activateTool(tool.name)
  }

  undo (): void {
    const { canUndo, actionManager } = this
    if (canUndo) { actionManager.undo() }
  }

  redo (): void {
    const { canRedo, actionManager } = this
    if (canRedo) { actionManager.redo() }
  }
}
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
    &.history-tools__button
    &.feedback__button {
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
