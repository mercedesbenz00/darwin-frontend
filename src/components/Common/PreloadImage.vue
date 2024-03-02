<template>
  <div class="preload-image" />
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

import { DatasetImagePayload } from '@/store/types'

@Component({ name: 'preload-image' })
export default class PreloadImage extends Vue {
  @Prop({ required: true, default: () => [] })
  images!: DatasetImagePayload[]

  queue: DatasetImagePayload[] = []

  @Watch('images')
  onImages () { debounce(this.preload, 200)() }

  mounted () { this.preload() }

  beforeDestroy () {
    // Dispose existing images
    this.$store.commit('workview/RESET_LOADED_IMAGE')
  }

  preload () {
    this.queue = [...this.images].reverse()
    this.processQueue()
  }

  async processQueue () {
    const imageToLoad = this.queue.pop()
    if (imageToLoad === undefined) {
      this.$emit('all-loaded')
      return
    }

    if (imageToLoad.image.format === 'tiled') {
      await this.$store.dispatch('workview/loadTiledImageData', imageToLoad)
    } else {
      await this.$store.dispatch('workview/loadItemImageData', imageToLoad)
    }
    this.processQueue()
  }
}
</script>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.preload-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
}
</style>
