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
import { computed, defineComponent } from 'vue'

import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

/**
 * @Component Annotation Border Opacity Manipulator
 */
export default defineComponent({
  name: 'BorderOpacityManipulator',
  components: { ImageManipulator, ManipulatorSlider },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const borderOpacity = computed({
      get (): number {
        return imageFilter.value?.borderOpacity ?? 0
      },
      set (borderOpacity: number): void {
        if (!imageFilter.value) { return }
        updateFilter({ borderOpacity })
      }
    })

    const refresh = (): void => {
      borderOpacity.value = 80
    }

    return { imageFilter, borderOpacity, refresh }
  }
})
</script>
