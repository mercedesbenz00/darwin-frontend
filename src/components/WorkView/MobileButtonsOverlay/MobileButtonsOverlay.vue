<template>
  <div
    v-if="renderMobileButtons && isDrawing"
    class="mobile-buttons"
    :style="style"
  >
    <positive-button
      size="small"
      @click="saveCurrentAnnotation"
    >
      Confirm
    </positive-button>
    <secondary-button
      size="small"
      @click="resetCurrentTool"
    >
      Cancel
    </secondary-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { Editor } from '@/engine/editor'
import { RootState } from '@/store/types'

@Component({ name: 'mobile-buttons-overlay' })
export default class MobileButtonsOverlay extends Vue {
  @Prop({ required: true })
  editor!: Editor;

  @State((state: RootState) => state.workview.renderMobileButtons)
  renderMobileButtons!: boolean

  get x (): number {
    return this.editor.camera.width - 200
  }

  get y (): number {
    return this.editor.camera.height - 50
  }

  get style () {
    return {
      left: `${this.x}px`,
      top: `${this.y}px`
    }
  }

  get isDrawing (): boolean {
    const tool = this.editor.toolManager.currentTool?.tool

    if (tool?.isDrawing) {
      return tool.isDrawing()
    }

    return false
  }

  saveCurrentAnnotation (): void {
    const toolEntry = this.editor.toolManager.currentTool

    if (toolEntry?.tool?.confirmCurrentAnnotation) {
      toolEntry.tool.confirmCurrentAnnotation(toolEntry.context)
    }
  }

  resetCurrentTool (): void {
    const toolEntry = this.editor.toolManager.currentTool

    if (toolEntry) {
      toolEntry.tool?.reset(toolEntry.context)
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-buttons {
  display: grid;
  position: absolute;
  grid-template-columns: 50% 50%;
  column-gap: 10px;
}
</style>
