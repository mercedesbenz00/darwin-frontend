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
import { computed, defineComponent, onMounted, onBeforeUnmount } from 'vue'

import KeyframeIcon from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/assets/keyframe.svg?inline'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models'

export default defineComponent({
  name: 'VideoAnnotationsKeyframeButton',
  components: { KeyframeIcon },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (props) {

    const currentFrameIndex = computed(() =>
      props.editor.activeView.currentFrameIndex
    )

    const selectedAnnotation = computed((): Annotation | undefined =>
      props.editor.activeView.annotationManager.selectedAnnotation
    )

    const selected = computed(() => {
      const { editor } = props
      const annotation = selectedAnnotation.value
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
      return currentDataFrame
    })

    const tooltipContent = computed(() => {
      if (selected.value) {
        return 'Remove current keyframe <span class="tooltip__hotkey">I</span>'
      } else {
        return 'Create a new keyframe <span class="tooltip__hotkey">I</span>'
      }
    })

    const createKeyframe = (): void => {
      if (!selectedAnnotation.value) { return }
      if (currentFrameIndex.value === undefined) { return }
      props.editor.activeView.createKeyFrame(selectedAnnotation.value, currentFrameIndex.value)
    }

    const removeKeyframe = (): void => {
      if (!selectedAnnotation.value) { return }
      if (currentFrameIndex.value === undefined) { return }
      props.editor.activeView.deleteKeyFrame(selectedAnnotation.value, currentFrameIndex.value)
    }

    const onClick = (): void => {
      if (selected.value) {
        removeKeyframe()
      } else {
        createKeyframe()
      }
    }

    const onKeyDown = (evt: KeyboardEvent): void => {
      if (evt.key === 'i') {
        onClick()
        evt.stopPropagation()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', onKeyDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('keydown', onKeyDown)
    })

    return {
      selected,
      tooltipContent,
      onClick
    }
  }
})
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
