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
import { computed, defineComponent } from 'vue'

import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

export default defineComponent({
  name: 'ImageSaturateManipulator',
  components: { ImageManipulator, ManipulatorSlider },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const saturate = computed({
      get (): number {
        return imageFilter.value?.saturate ?? 0
      },
      set (saturate: number): void {
        if (!imageFilter.value) { return }
        updateFilter({ saturate })
      }
    })

    const refresh = (): void => {
      saturate.value = 100
    }

    return { imageFilter, saturate, refresh }
  }
})
</script>
