<template>
  <div class="video-annotations-video-control">
    <video-annotations-pagination />
    <video-annotations-play-button />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import VideoAnnotationsPagination from './VideoAnnotationsPagination.vue'
import VideoAnnotationsPlayButton from './VideoAnnotationsPlayButton.vue'

export default defineComponent({
  name: 'V2VideoAnnotationsVideoControl',
  components: { VideoAnnotationsPagination, VideoAnnotationsPlayButton }
})

</script>

<style lang="scss" scoped>
.video-annotations-video-control {
  @include row--center;
  height: 30px;
  background: $colorAliceShade;
  padding: 0 5px;
}
</style>
