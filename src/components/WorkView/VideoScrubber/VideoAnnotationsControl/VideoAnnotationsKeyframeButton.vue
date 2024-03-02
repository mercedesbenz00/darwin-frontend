<template>
  <button
    v-if="editor.loadedVideo"
    v-tooltip="{ content: tooltipContent, placement: 'top', delay: 1000 }"
    class="keyframe-button"
    :class="{ 'keyframe-button--selected': selected }"
    @click.stop="onClick"
  >
    <keyframe-icon />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import KeyframeIcon from './assets/keyframe.svg?inline'

@Component({
  name: 'video-annotations-keyframe-button',
  components: { KeyframeIcon }
})
export default class VideoAnnotationsKeyframeButton extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get currentFrameIndex () {
    return this.editor.activeView.currentFrameIndex
  }

  get selected () {
    const { editor } = this
    const annotation = editor.selectedAnnotation
    if (!annotation) { return false }
    if (!annotation.isVideoAnnotation()) { return false }
    const annotationData = annotation.data

    const currentDataFrame = annotationData.frames[editor.activeView.currentFrameIndex]
    // keyframe button is active when either mainframe or subframe exists
    if (currentDataFrame) {
      return currentDataFrame
    } else if (annotationData.sub_frames) {
      const currentSubFrame = annotationData.sub_frames[editor.activeView.currentFrameIndex]
      return currentSubFrame
    }
  }

  get tooltipContent () {
    if (this.selected) {
      return 'Remove current keyframe <span class="tooltip__hotkey">I</span>'
    } else {
      return 'Create a new keyframe <span class="tooltip__hotkey">I</span>'
    }
  }

  mounted (): void {
    document.addEventListener('keydown', this.onKeyDown)
    this.$once('hook:beforeDestroy', () =>
      document.removeEventListener('keydown', this.onKeyDown)
    )
  }

  createKeyframe (): void {
    const { editor } = this
    if (!editor.selectedAnnotation) { return }
    if (this.currentFrameIndex === undefined) { return }
    this.editor.activeView.createKeyFrame(editor.selectedAnnotation, this.currentFrameIndex)
  }

  removeKeyframe (): void {
    const { editor } = this
    if (!editor.selectedAnnotation) { return }
    if (this.currentFrameIndex === undefined) { return }
    this.editor.activeView.deleteKeyFrame(editor.selectedAnnotation, this.currentFrameIndex)
  }

  onClick (): void {
    if (this.selected) {
      this.removeKeyframe()
    } else {
      this.createKeyframe()
    }
  }

  onKeyDown (evt: KeyboardEvent): void {
    if (evt.key === 'i') {
      this.onClick()
      evt.stopPropagation()
    }
  }
}
</script>

<style lang="scss" scoped>
.keyframe-button {
  @include row--center;
  width: 20px;
  height: 20px;
  background: none;
  border-radius: 20px;
  padding: 3px;
  cursor: pointer;

  svg {
    color: $colorAliceNight;
    width: 100%;
    height: 100%;
  }

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}

.keyframe-button--selected {
  svg {
    color: $colorPink;
  }
}
</style>
