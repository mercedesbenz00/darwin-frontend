<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Contrast
    </template>
    <template #value>
      {{ contrast }}%
    </template>
    <template #slider>
      <manipulator-slider
        v-model="contrast"
        :min="0"
        :max="200"
      />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

@Component({
  name: 'image-contrast-manipulator',
  components: { ImageManipulator, ManipulatorSlider }
})
export default class ImageContrastManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get contrast () {
    return this.editor.activeView.imageFilter.contrast
  }

  set contrast (val: number) {
    this.editor.activeView.imageFilter.contrast = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }

  refresh () {
    this.contrast = 100
  }
}
</script>
