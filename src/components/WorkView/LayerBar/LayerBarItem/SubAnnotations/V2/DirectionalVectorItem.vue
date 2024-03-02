<template>
  <sub-annotation-item
    v-if="data"
    class="directional-vector-item"
    :annotation-class="annotationClass"
    :readonly="readonly"
    type="directional_vector"
  >
    {{ label }}
  </sub-annotation-item>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { DirectionalVector } from '@/engineV2/plugins/directionalVector/types'
import { StageAnnotation } from '@/store/modules/workview/types'
import { AnnotationClassPayload } from '@/store/types'

import SubAnnotationItem from './SubAnnotationItem.vue'

export default defineComponent({
  name: 'DirectionalVectorItem',
  components: { SubAnnotationItem },
  props: {
    annotation: { required: true, type: Object as () => StageAnnotation },
    annotationClass: { required: true, type: Object as () => AnnotationClassPayload },
    data: { required: false, default: null, type: Object as () => DirectionalVector | null },
    readonly: { required: false, default: false, type: Boolean }
  },
  setup (props) {
    const label = computed(() => {
      if (!props.data) { return '' }
      const { angle = 0, length = 0 } = props.data
      const angleInDegrees = angle * 180 / Math.PI
      // show negative angles as positive
      const positiveAngleDegrees = ((angleInDegrees % 360) + 360) % 360
      return `A: ${positiveAngleDegrees.toFixed(2)}° L: ${length.toFixed(2)}px`
    })

    return {
      label
    }
  }
})
</script>

<style lang="scss" scoped>
.directional-vector-item {
  align-items: center;

  @include typography(sm);
  color: $colorAliceNight;

  :deep(.sub-annotation-item__icon) {
    // This is because the svg icon has some left-padding.
    // To align vertically with others, add margin-left here.
    margin-left: -2px;
    margin-right: 2px;
  }
}
</style>
