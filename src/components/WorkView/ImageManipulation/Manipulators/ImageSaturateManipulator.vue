<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Image Saturation
    </template>
    <template #value>
      {{ saturate }}%
    </template>
    <template #slider>
      <manipulator-slider
        v-model="saturate"
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
  name: 'image-saturate-manipulator',
  components: { ImageManipulator, ManipulatorSlider }
})
export default class ImageSaturateManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get saturate () {
    return this.editor.activeView.imageFilter.saturate
  }

  set saturate (val: number) {
    this.editor.activeView.imageFilter.saturate = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }

  refresh () {
    this.saturate = 100
  }
}
</script>
