<template>
  <!-- TODO: Uses button class from main style -->
  <div
    class="header"
    :style="style"
  >
    <secondary-button
      class="clear"
      size="small"
      @click="onClear"
    >
      Clear
    </secondary-button>
    <secondary-button
      class="rerun"
      size="small"
      :disable="busy"
      @click="tryRerun"
    >
      Rerun
    </secondary-button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'ClickHeaderTools',
  props: {
    x: { required: true, type: Number },
    y: { required: true, type: Number },
    onClear: { required: true, type: Function },
    onRerun: { required: true, type: Function },
    busy: { required: true, type: Boolean }
  },
  setup (props) {
    const style = computed(() => {
      return {
        left: `${props.x}px`,
        top: `${props.y}px`
      }
    })

    const tryRerun = (): void => {
      if (!props.busy) {
        props.onRerun()
      }
    }

    return {
      style, tryRerun
    }
  }

})
</script>

<style lang="scss" scoped>
.header {
  position: absolute;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 5px;
}

.clear,
.rerun {
  background: transparent;
  border-color: $colorWhite !important;
  color: $colorWhite !important;
  text-transform: uppercase;

  &:hover, &:active {
    background: transparent;
  }
}
</style>
