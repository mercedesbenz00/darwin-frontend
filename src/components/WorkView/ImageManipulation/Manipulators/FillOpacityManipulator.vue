<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Annotation Fill Opacity
    </template>
    <template #value>
      {{ opacity }}%
    </template>
    <template #slider>
      <manipulator-slider v-model="opacity" />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

@Component({
  name: 'fill-opacity-manipulator',
  components: { ImageManipulator, ManipulatorSlider }
})
export default class FillOpacityManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get opacity () {
    return this.editor.activeView.imageFilter.opacity
  }

  set opacity (val: number) {
    this.editor.activeView.imageFilter.opacity = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }

  refresh () {
    this.opacity = 15
  }
}
</script>
