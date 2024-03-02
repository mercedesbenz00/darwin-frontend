<template>
  <div v-if="showMeasures">
    <measure-overlay
      v-for="(data, index) in annotations"
      :key="index"
      :data="data"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import MeasureOverlay from '@/components/WorkView/MeasureOverlay/MeasureOverlay.vue'
import { useStore } from '@/composables'
import { useMeasureOverlayData } from '@/composables/useEditorV2'
import { View } from '@/engineV2/views'

export default defineComponent({
  name: 'MeasureOverlays',
  components: { MeasureOverlay },
  props: {
    view: { required: true, type: Object as () => View }
  },
  setup (props) {
    const { state } = useStore()

    const viewRef = computed(() => props.view)
    const annotations = useMeasureOverlayData(viewRef)

    const renderMeasures = computed(() => state.workview.renderMeasures)

    const showMeasures = computed((): boolean => {
      return renderMeasures.value && !!viewRef.value.measureManager.measureRegion
    })

    return {
      annotations,
      showMeasures
    }
  }
})
</script>
