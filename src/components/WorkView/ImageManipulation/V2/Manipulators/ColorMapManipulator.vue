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
import { ref, computed, defineComponent } from 'vue'

import { useEditorLayout, useEditorV2 } from '@/composables/useEditorV2'
import { useImageManipulationFilter } from '@/composables/useEditorV2/useImageFilter'
import { ColorMap } from '@/engineCommon/imageManipulation'

import ColorMapDropdown from './components/ColorMapDropdown.vue'
import ImageManipulator from './components/ImageManipulator.vue'

export default defineComponent({
  name: 'ColorMapManipulator',
  components: { ColorMapDropdown, ImageManipulator },
  setup () {
    const { imageFilter, updateFilter } = useImageManipulationFilter()
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }
    const layout = useEditorLayout()
    const isSyncMode = ref(true)

    const colorMap = computed({
      get (): ColorMap {
        return imageFilter.value?.colorMap
      },
      set (colorMap: ColorMap): void {
        if (!imageFilter.value) { return }
        updateFilter({ colorMap })
      }
    })

    return {
      imageFilter,
      colorMap,
      hasMoreThenOneSection: layout.value.viewsList.length > 1,
      isSyncMode
    }
  }
})
</script>
