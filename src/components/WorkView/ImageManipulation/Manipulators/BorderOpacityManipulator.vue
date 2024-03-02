<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Annotation Border Opacity
    </template>
    <template #value>
      {{ borderOpacity }}%
    </template>
    <template #slider>
      <manipulator-slider v-model="borderOpacity" />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

@Component({
  name: 'border-opacity-manipulator',
  components: { ImageManipulator, ManipulatorSlider }
})
export default class BorderOpacityManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get borderOpacity () {
    return this.editor.activeView.imageFilter.borderOpacity
  }

  set borderOpacity (val: number) {
    this.editor.activeView.imageFilter.borderOpacity = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }

  refresh () {
    this.borderOpacity = 80
  }
}
</script>
