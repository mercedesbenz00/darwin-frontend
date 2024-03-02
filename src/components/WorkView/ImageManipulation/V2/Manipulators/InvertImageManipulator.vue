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
import { computed, defineComponent } from 'vue'

import CheckBox from '@/components/Common/CheckBox/V1/CheckBox.vue'
import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'

import ImageManipulator from './components/ImageManipulator.vue'

export default defineComponent({
  name: 'BorderOpacityManipulator',
  components: { CheckBox, ImageManipulator },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()

    const isInverted = computed({
      get (): boolean {
        return imageFilter.value?.isInverted
      },
      set (isInverted: boolean): void {
        if (!imageFilter.value) { return }
        updateFilter({ isInverted })
      }
    })

    return { imageFilter, isInverted }
  }
})
</script>
