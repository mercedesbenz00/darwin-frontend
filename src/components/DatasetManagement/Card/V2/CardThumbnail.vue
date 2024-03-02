<template>
  <div class="card-thumbnail">
    <template v-if="type === 'folder'">
      <img
        v-if="url"
        v-lazy="url"
        class="card-thumbnail__img card-thumbnail__img--folder"
      >
      <div
        v-else
        class="card-thumbnail__folder_placeholder"
      />
    </template>
    <template v-else>
      <div
        v-if="!url"
        class="card-thumbnail__placeholder"
      />
      <img
        v-else
        v-lazy="url"
        class="card-thumbnail__img"
      >
      <video-overlay-icon
        v-if="!isDicom && !isPdf && type === 'video'"
        class="card-thumbnail__video_overlay"
      />
      <frames-overlay-icon
        v-if="isDicom || isPdf || type === 'video-frames'"
        class="card-thumbnail__video_overlay"
      />
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

import FramesOverlayIcon from '@/components/DatasetManagement/assets/frames-overlay.svg?inline'
import VideoOverlayIcon from '@/components/DatasetManagement/assets/video-overlay.svg?inline'

export default defineComponent({
  name: 'CardThumbnail',
  components: { FramesOverlayIcon, VideoOverlayIcon },
  props: {
    url: { type: String, default: null, required: false },
    isDicom: { type: Boolean, default: false },
    isPdf: { type: Boolean, default: false },
    type: { type: String as () => 'folder' | 'image' | 'video' | 'video-frames', default: 'image' }
  }
})
</script>

<style lang="scss" scoped>
.card-thumbnail {
  box-shadow: $effectShadowsSM;
}

.card-thumbnail,
.card-thumbnail__img,
.card-thumbnail__folder_placeholder,
.card-thumbnail__placeholder,
.card-thumbnail__video_overlay {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.card-thumbnail__img {
  object-fit: cover;
}

.card-thumbnail__folder_placeholder {
  background: $colorAliceNight;
}

.card-thumbnail__placeholder {
  @include loadingFlowAnimation;
}

.card-thumbnail__video_overlay {
  position: absolute;
  @include fullsize;
}
</style>
