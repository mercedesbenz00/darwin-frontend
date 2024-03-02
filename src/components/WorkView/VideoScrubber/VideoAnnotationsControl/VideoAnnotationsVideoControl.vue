<template>
  <div class="video-annotations-video-control">
    <video-annotations-pagination :editor="editor" />
    <video-annotations-play-button :editor="editor" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import VideoAnnotationsPagination from './VideoAnnotationsPagination.vue'
import VideoAnnotationsPlayButton from './VideoAnnotationsPlayButton.vue'

@Component({
  name: 'video-annotations-video-control',
  components: { VideoAnnotationsPagination, VideoAnnotationsPlayButton }
})
export default class VideoAnnotationsVideoControl extends Vue {
  @Prop({ required: true })
  editor!: Editor
}
</script>

<style lang="scss" scoped>
.video-annotations-video-control {
  @include row--center;
  height: 30px;
  background: $colorAliceShade;
  padding: 0 5px;
}
</style>
