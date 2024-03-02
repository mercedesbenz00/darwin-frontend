<template>
  <circle-spinner
    v-if="show"
    class="click-spinner"
    :style="style"
    aria-label="Loading…"
    :dark="false"
    :width="size"
    :height="size"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

import { CircleSpinner } from '@/components/Common/LoadingIndicators'

export default defineComponent({
  name: 'ClickSpinner',
  components: { CircleSpinner },
  props: {
    x: { required: true, type: Number },
    y: { required: true, type: Number },
    show: { required: true, type: Boolean },
  },

  setup (props) {
    const size = 24

    const style = computed(() => {
      return {
        left: `${props.x - size / 2}px`,
        top: `${props.y - size / 2}px`
      }
    })

    return {
      size,
      style
    }
  }
})
</script>

<style lang="scss" scoped>
.click-spinner {
  position: absolute;
  margin: 0;
}
</style>
