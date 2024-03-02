<template>
  <popup-menu
    v-if="visible"
    v-click-outside="onClickOutside"
    class="context-menu"
    :style="{ left, top }"
  >
    <popup-menu-item @click.native.prevent="onCreateKeyFrame">
      Create Key Frame
    </popup-menu-item>
    <popup-menu-item
      v-if="keyframeToDelete"
      theme="crimson"
      @click.native.prevent="onDeleteKeyFrame"
    >
      Delete Key Frame
    </popup-menu-item>
    <popup-menu-item @click.native.prevent="onChangeClass">
      Change Annotation Class
    </popup-menu-item>
    <popup-menu-item
      theme="crimson"
      @click.native.prevent="onDeleteAnnotation"
    >
      Delete Annotation
    </popup-menu-item>
  </popup-menu>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import PopupMenu from '@/components/Common/PopupMenu/V1/PopupMenu.vue'
import PopupMenuItem from '@/components/Common/PopupMenu/V1/PopupMenuItem.vue'
import { changeAnnotationClass } from '@/engine/actions'
import { Editor } from '@/engine/editor'
import { Annotation } from '@/engine/models'

@Component({
  name: 'context-menu',
  components: { PopupMenu, PopupMenuItem }
})
export default class ContextMenu extends Vue {
  @Prop({ required: false, default: null })
  annotation!: Annotation | null

  @Prop({ required: true })
  editor!: Editor

  /**
   * x is the fixed horizontal position inside the viewport
   */
  @Prop({ required: true })
  x!: number

  /**
   * y is the fixed vertical position inside the viewport
   */
  @Prop({ required: true })
  y!: number

  /**
   * offsetX is the x offset inside the parent annotation
   */
  @Prop({ required: true })
  offsetX!: number

  @Prop({ required: true })
  visible!: boolean

  @Prop({ required: true })
  keyframeToDelete!: number | null

  @State(state => state.ui.workviewVideoFrameLineWidth)
  frameLineWidth!: number

  get left () {
    return `${this.x}px`
  }

  get top () {
    return `${this.y}px`
  }

  onCreateKeyFrame (): void {
    const { annotation, editor, frameLineWidth, offsetX } = this
    if (!annotation) { return }
    const startIndex = annotation.data.segments[0][0]
    const frameIndex = startIndex + Math.floor(offsetX / frameLineWidth)
    editor.activeView.createKeyFrame(annotation, frameIndex)
    this.$emit('close')
  }

  onDeleteKeyFrame (): void {
    const { annotation, editor, keyframeToDelete } = this
    editor.activeView.deleteKeyFrame(annotation, keyframeToDelete)
    this.$emit('close')
  }

  async onChangeClass (): Promise<void> {
    const { annotation, editor } = this
    if (!annotation) { return }

    const annotationClass = await editor.classDialog.requestUserSelectClass(
      annotation.type,
      annotation.classId
    )
    if (!annotationClass) { return }

    const action = changeAnnotationClass(editor, annotation, annotationClass)
    editor.actionManager.do(action)
    this.$emit('close')
  }

  async onDeleteAnnotation () {
    const { annotation, editor } = this
    if (!annotation) { return }

    await editor.activeView.removeAnnotation(annotation)
    this.$emit('close')
  }

  onClickOutside () {
    this.$emit('close')
  }
}
</script>

<style lang="scss" scoped>
.context-menu {
  position: fixed;
  z-index: var(--workview-video-controls-context-menu) !important;
}
</style>
