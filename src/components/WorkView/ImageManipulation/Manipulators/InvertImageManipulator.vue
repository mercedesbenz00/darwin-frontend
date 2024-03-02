<template>
  <image-manipulator>
    <template #label>
      <check-box
        v-model="isInverted"
        name="inverted"
        label="Invert Image"
      />
    </template>
  </image-manipulator>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { Editor } from '@/engine/editor'

import ImageManipulator from './components/ImageManipulator.vue'

@Component({
  name: 'invert-image-manipulator',
  components: { CheckBox, ImageManipulator }
})
export default class ImageManipulation extends Vue {
  @Prop({ required: true })
  editor!: Editor

  get isInverted () {
    return this.editor.activeView.imageFilter.isInverted
  }

  set isInverted (val: boolean) {
    this.editor.activeView.imageFilter.isInverted = val
    this.editor.activeView.setImageFilter(this.editor.activeView.imageFilter)
  }
}
</script>
