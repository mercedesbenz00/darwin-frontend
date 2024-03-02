<template>
  <button
    class="video-annotations-play-button"
    @click="onClick"
  >
    <pause-icon v-if="isPlaying" />
    <play-icon v-else />
  </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import PauseIcon from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/assets/pause.svg?inline'
import PlayIcon from '@/components/WorkView/VideoScrubber/VideoAnnotationsControl/assets/play.svg?inline'
import { useActiveView } from '@/composables/useEditorV2'
import { VideoView } from '@/engineV2/views'

export default defineComponent({
  name: 'VideoAnnotationsPlayButton',
  components: { PauseIcon, PlayIcon },
  setup () {
    const activeView = useActiveView()

    const isPlaying = computed((): boolean => {
      if (activeView.value instanceof VideoView) {
        return activeView.value.isPlaying
      }

      return false
    })

    const onClick = (): void => {
      if (activeView.value instanceof VideoView) {
        activeView.value.togglePlayPause()
      }
    }

    return {
      isPlaying,
      onClick
    }
  }
})
</script>

<style lang="scss" scoped>
.video-annotations-play-button {
  @include row--center;
  width: 19px;
  height: 19px;
  border: none;
  outline: none;
  padding: 0;
  background: transparent;
  border-radius: 50%;

  &:hover {
    background: $colorAliceShadowTransparent;
  }

  &:active {
    background: $colorAliceShadow;
  }

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
