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
import { computed, defineComponent } from 'vue'

import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'

import ImageManipulator from './components/ImageManipulator.vue'
import ManipulatorSlider from './components/ManipulatorSlider.vue'

export default defineComponent({
  name: 'FillOpacityManipulator',
  components: { ImageManipulator, ManipulatorSlider },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const opacity = computed({
      get (): number {
        return imageFilter.value?.opacity
      },
      set (opacity: number): void {
        if (!imageFilter.value) { return }
        updateFilter({ opacity })
      }
    })

    const refresh = (): void => {
      opacity.value = 15
    }

    return { imageFilter, opacity, refresh }
  }
})
</script>
