<template>
  <image-manipulator
    :optional-sync="hasMoreThenOneSection"
    :is-sync-mode.sync="isSyncMode"
  >
    <template #label>
      Color Map
    </template>
    <template #slider>
      <color-map-dropdown v-model="colorMap" />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import { Editor } from '@/engine/editor'
import { ColorMap } from '@/engineCommon/imageManipulation'

import ColorMapDropdown from './components/ColorMapDropdown.vue'
import ImageManipulator from './components/ImageManipulator.vue'

@Component({
  name: 'color-map-manipulator',
  components: { ColorMapDropdown, ImageManipulator }
})
export default class ColorMapManipulator extends Vue {
  @Prop({ required: true })
  editor!: Editor

  isSyncMode: boolean = true

  get hasMoreThenOneSection (): boolean {
    return this.editor.viewsList.length > 1
  }

  get colorMap (): ColorMap {
    return this.editor.activeView.imageFilter.colorMap
  }

  set colorMap (val: ColorMap) {
    if (this.isSyncMode) {
      this.editor.viewsList.forEach(view => {
        view.imageFilter.colorMap = val
        view.setImageFilter(view.imageFilter)
      })
    } else {
      this.editor.activeView.imageFilter.colorMap = val
      this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
    }
  }
}
</script>
