<template>
  <image-manipulator @refresh="refresh">
    <template #label>
      Contrast
    </template>
    <template #value>
      {{ contrast }}%
    </template>
    <template #slider>
      <manipulator-slider
        v-model="contrast"
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
  name: 'ImageContrastManipulator',
  components: { ImageManipulator, ManipulatorSlider },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const contrast = computed({
      get (): number {
        return imageFilter.value?.contrast ?? 0
      },
      set (contrast: number): void {
        if (!imageFilter.value) { return }
        updateFilter({ contrast })
      }
    })

    const refresh = (): void => {
      contrast.value = 100
    }

    return { imageFilter, contrast, refresh }
  }
})
</script>
