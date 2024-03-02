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
import Component from 'vue-class-component'
import { Prop, Vue } from 'vue-property-decorator'

import FramesOverlayIcon from '@/components/DatasetManagement/assets/frames-overlay.svg?inline'
import VideoOverlayIcon from '@/components/DatasetManagement/assets/video-overlay.svg?inline'

@Component({
  name: 'card-thumbnail',
  components: { FramesOverlayIcon, VideoOverlayIcon }
})
export default class CardThumbnail extends Vue {
  @Prop({ default: null })
  url!: string | null

  @Prop({ default: false, type: Boolean })
  isDicom!: boolean

  @Prop({ default: false, type: Boolean })
  isPdf!: boolean

  @Prop({ default: 'image', type: String })
  type!: 'folder' | 'image' | 'video' | 'video-frames'
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.card-thumbnail,
.card-thumbnail__img,
.card-thumbnail__folder_placeholder,
.card-thumbnail__placeholder,
.card-thumbnail__video_overlay {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 3px;
  overflow: hidden;
}

.card-thumbnail__img {
  object-fit: cover;
}

.card-thumbnail__img--folder {
  padding: 2px;
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
