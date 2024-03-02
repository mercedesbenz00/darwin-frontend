<template>
  <div
    class="circle-progress"
    ref="rootEl"
  >
    <canvas
      ref="circleProgressCV"
      width="14"
      height="14"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'

import DrawCircle from './drawCircle'

export default defineComponent({
  name: 'CircleProgress',
  props: {
    progress: { required: true, type: Number, default: 0 }
  },
  setup (props) {
    const circleProgressCV = ref<HTMLCanvasElement | null>(null)
    const drawCircle = ref<DrawCircle | null>(null)
    const rootEl = ref<HTMLDivElement | null>(null)

    const updateCircle = (pg: number): void => {
      if (!drawCircle.value) { return }
      if (!rootEl.value) { return }

      const color = window.getComputedStyle(rootEl.value).borderColor
      drawCircle.value.render(pg, color)
    }

    onMounted(() => {
      const canvas = circleProgressCV.value
      if (!canvas) { return }

      const context = canvas.getContext('2d')
      if (!context) { return }
      drawCircle.value = new DrawCircle({ canvas, context })
      
      updateCircle(props.progress)
    })

    watch(() => props.progress, (pg) => updateCircle(pg))

    return {
      circleProgressCV,
      rootEl,
    }
  }
})
</script>

<style lang="scss" scoped>
.circle-progress {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 14px;
  height: 14px;

  border-radius: 100%;
  background-color: transparent;
  border: 1px solid $colorContentInverted;

  & > canvas {
    width: 14px;
    height: 14px;
  }
}
</style>
