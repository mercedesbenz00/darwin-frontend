<template>
  <button
    v-tooltip="{ content: tooltipContent, placement: 'top', delay: 1000 }"
    class="video-annotations-annotation-toggle"
    @click.stop="onClick"
  >
    <eye-opened-icon v-if="isVisible" />
    <eye-closed-icon v-else />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { EyeClosedIcon, EyeOpenedIcon } from '@/assets/icons/V1'
import { Editor } from '@/engine/editor'

@Component({
  name: 'video-annotations-annotation-toggle',
  components: { EyeClosedIcon, EyeOpenedIcon }
})
export default class VideoAnnotationsAnnotationToggle extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get isVisible () {
    const { selectedAnnotation } = this.editor.activeView
    return selectedAnnotation && selectedAnnotation.isVisible
  }

  get tooltipContent () {
    if (this.isVisible) {
      return 'Hide Annotation'
    } else {
      return 'Show Annotation'
    }
  }

  onClick () {
    const { selectedAnnotation } = this.editor.activeView
    if (!selectedAnnotation) { return }
    if (selectedAnnotation.isVisible) {
      selectedAnnotation.hide()
    } else {
      selectedAnnotation.show()
    }
  }
}
</script>

<style lang="scss" scoped>
.video-annotations-annotation-toggle {
  @include row--center;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  padding: 3px;
  background: none;
  cursor: pointer;

  svg {
    width: 100%;
    height: 100%;
    color: $colorAliceNight;
  }

  &:hover {
    background: $colorAliceShade;
  }

  &:active {
    background: $colorAliceShadow;
  }
}
</style>
