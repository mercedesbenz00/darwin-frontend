<template>
  <image-manipulator>
    <template #label>
      <check-box
        v-model="isPixelView"
        name="pixel-view"
        label="Pixel View"
      />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { Editor } from '@/engine/editor'
import { getFileExtension } from '@/utils'

import ImageManipulator from './components/ImageManipulator.vue'

@Component({
  name: 'pixel-view-manipulator',
  components: { CheckBox, ImageManipulator }
})
export default class ImageManipulation extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get isPixelView (): boolean {
    return !this.editor.activeView.imageFilter.isImageSmoothing
  }

  set isPixelView (val: boolean) {
    const isSmoothing = !val
    this.editor.activeView.imageFilter.isImageSmoothing = isSmoothing
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
    if (this.editor.activeView.loadedImage?.originalFilename) {
      const extension = getFileExtension(this.editor.activeView.loadedImage.originalFilename)
      window.localStorage.setItem(
        `isImageSmoothing:${extension}`, isSmoothing ? 'on' : 'off'
      )
    }
  }
}
</script>
