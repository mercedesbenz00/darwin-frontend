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
import { computed, defineComponent } from 'vue'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { useActiveView } from '@/composables/useEditorV2'
import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'
import { getFileExtension } from '@/utils'

import ImageManipulator from './components/ImageManipulator.vue'

export default defineComponent({
  name: 'BorderOpacityManipulator',
  components: { CheckBox, ImageManipulator },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()
    const activeView = useActiveView()

    const isPixelView = computed({
      get (): boolean {
        return !imageFilter.value?.isImageSmoothing
      },
      set (isPixelView: boolean): void {
        if (!imageFilter.value) { return }
        updateFilter({ isImageSmoothing: !isPixelView })
        if (activeView.value.fileManager.filename) {
          window.localStorage.setItem(
            `isImageSmoothing:${getFileExtension(activeView.value.fileManager.filename)}`,
            isPixelView ? 'on' : 'off'
          )
        }
      }
    })

    return { imageFilter, isPixelView }
  }
})
</script>
