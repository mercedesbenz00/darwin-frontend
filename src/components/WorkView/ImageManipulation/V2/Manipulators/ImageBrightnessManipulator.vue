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
import { computed, defineComponent } from 'vue'

import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

export default defineComponent({
  name: 'ImageBrightnessManipulator',
  components: { ImageManipulator, ManipulatorSlider },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const brightness = computed({
      get (): number {
        return imageFilter.value?.brightness ?? 0
      },
      set (brightness: number): void {
        if (!imageFilter.value) { return }
        updateFilter({ brightness })
      }
    })

    const refresh = (): void => {
      brightness.value = 80
    }

    return { imageFilter, brightness, refresh }
  }
})
</script>
