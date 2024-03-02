<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Brightness
    </template>
    <template #value>
      {{ brightness }}%
    </template>
    <template #slider>
      <manipulator-slider
        v-model="brightness"
        :min="0"
        :max="500"
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
  name: 'image-brightness-manipulator',
  components: { ImageManipulator, ManipulatorSlider }
})
export default class ImageBrightnessManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get brightness () {
    return this.editor.activeView.imageFilter.brightness
  }

  set brightness (val: number) {
    this.editor.activeView.imageFilter.brightness = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }

  refresh () {
    this.brightness = 100
  }
}
</script>
