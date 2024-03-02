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
import { Component, Vue, Prop } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import PauseIcon from './assets/pause.svg?inline'
import PlayIcon from './assets/play.svg?inline'

@Component({
  name: 'video-annotations-play-button',
  components: { PauseIcon, PlayIcon }
})
export default class VideoAnnotationsPlayButton extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get isPlaying () {
    return this.editor.isPlaying
  }

  onClick () {
    if (this.isPlaying) {
      this.editor.stopVideo()
    } else {
      this.editor.playVideo()
    }
  }
}
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
