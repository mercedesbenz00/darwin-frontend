<template>
  <div
    v-if="showMeasures && measureData"
    class="measures-item"
  >
    {{ measureData.label }}
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { useStore } from '@/composables'
import { useActiveView } from '@/composables/useEditorV2'
import { StageAnnotation } from '@/store/modules/workview/types'

export default defineComponent({
  name: 'MeasuresItem',
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const activeView = useActiveView()

    const { state } = useStore()

    const renderMeasures = computed(() => state.workview.renderMeasures)

    const showMeasures = computed(() => {
      return renderMeasures.value && !!activeView.value.measureManager.measureRegion
    })

    const measureData = computed(() => {
      return activeView.value.measureManager.measureOverlayDataEntries[props.annotation.id]
    })

    return {
      showMeasures,
      measureData
    }
  }
})
</script>

<style lang="scss" scoped>
.measures-item {
  @include typography(sm);
  color: $colorAliceNight;
  margin-left: 2px;
}
</style>
