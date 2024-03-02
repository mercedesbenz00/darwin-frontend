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
import { computed, defineComponent } from 'vue'

import { EyeClosedIcon, EyeOpenedIcon } from '@/assets/icons/V1'
import { Editor } from '@/engineV2/editor'

export default defineComponent({
  name: 'VideoAnnotationsAnnotationToggle',
  components: { EyeClosedIcon, EyeOpenedIcon },
  props: {
    editor: { required: true, type: Object as () => Editor }
  },
  setup (props) {

    const isVisible = computed(() => {
      const { selectedAnnotation } = props.editor.activeView.annotationManager
      return selectedAnnotation && selectedAnnotation.isVisible
    })

    const tooltipContent = computed(() => {
      if (isVisible.value) {
        return 'Hide Annotation'
      } else {
        return 'Show Annotation'
      }
    })

    const onClick = (): void => {
      const { selectedAnnotation } = props.editor.activeView.annotationManager
      if (!selectedAnnotation) { return }
      if (selectedAnnotation.isVisible) {
        selectedAnnotation.hide()
      } else {
        selectedAnnotation.show()
      }
    }

    return {
      isVisible,
      tooltipContent,
      onClick
    }
  }
})
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
