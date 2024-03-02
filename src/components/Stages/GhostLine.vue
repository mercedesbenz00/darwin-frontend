<template>
  <div
    ref="endPoint"
    class="ghost-line"
    :style="style"
  />
</template>
<script lang="ts">
import LeaderLine from 'leader-line-new'
import { throttle } from 'lodash'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useLeaderLines } from '@/components/WorkflowCreation/useLeaderLines'
import { StageType } from '@/store/types'
import { stageTheme } from '@/utils/workflowStageTheme'

const createLeaderLine = (startEl: HTMLElement, endEl: HTMLElement, color: string): LeaderLine =>
  new LeaderLine(startEl, endEl, {
    color,
    size: 3,
    path: 'fluid',
    startSocket: 'right',
    endSocket: 'left',
    endPlugSize: 1,
    startPlug: 'behind',
    endPlug: 'arrow1',
    dash: { animation: true }
  })

export default defineComponent({
  props: {
    startType: { type: String as () => StageType, required: true },
    startId: { type: String, required: true },
    startX: { type: Number, required: true },
    startY: { type: Number, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    zoomScale: { type: Number, required: true }
  },
  render () { return null },
  setup (props) {
    const endPoint = ref<HTMLElement | null>(null)

    const {
      addLeaderLine,
      removeLeaderLine,
      updateLeaderLine
    }  = useLeaderLines()

    onMounted(() => {
      const startPoint = document.getElementById(props.startId)
      if (!startPoint || !endPoint.value) { return }
      const color = stageTheme[props.startType].edgeColorFocus
      const line = createLeaderLine(startPoint, endPoint.value, color)
      addLeaderLine('ghost', line)
    })

    onBeforeUnmount(() => {
      removeLeaderLine('ghost')
      // Hot fix till we will delete leader line lib
      document.body
        .querySelectorAll('.leader-line')
        .forEach(el => {
          el.remove()
        })
    })

    const style = computed(() => {
      const deltaX = Math.round((props.x - props.startX) / props.zoomScale)
      const deltaY = Math.round((props.y - props.startY) / props.zoomScale)

      return {
        transform: `translate(${deltaX}px, ${deltaY}px)`
      }
    })

    const throttledUpdateLeaderLine = throttle(updateLeaderLine, 20)

    watch(style, () => {
      throttledUpdateLeaderLine('ghost')
    })

    return { endPoint, style }
  }
})
</script>
