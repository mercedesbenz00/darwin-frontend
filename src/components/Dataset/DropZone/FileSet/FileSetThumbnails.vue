<template>
  <div class="file-set-thumbnails">
    <div
      v-for="(thumb, index) in thumbnails"
      :key="index"
      class="file-set-thumbnail"
    >
      <img :src="thumb">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component({ name: 'file-set-thumbnails' })
export default class FileSetThumbnails extends Vue {
  @Prop({ required: true, type: Array as () => string[] })
  thumbnails!: string[]
}
</script>

<style lang="scss" scoped>
.file-set-thumbnails {
  @include row--distributed;
  position: relative;
  width: 100%;
  height: 50px;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
  background: #C4C4C4;
}

.file-set-thumbnail {
  width: calc(33% - 3px);
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;
    object-fit: cover;
  }
}
</style>
