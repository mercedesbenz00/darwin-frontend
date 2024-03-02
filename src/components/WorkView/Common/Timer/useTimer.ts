import { ComputedRef, computed, onMounted, onUnmounted, reactive } from 'vue'

import { TooltipOptions } from '@/types'
import { unixSeconds } from '@/utils'
import { AUTO_COMPLETE_USER_TIME_MS } from '@/utils/workflows'

// Maximum amount of seconds timer can run for
const MAX_SECONDS = AUTO_COMPLETE_USER_TIME_MS / 1000

export const useTimer = (completesAt: number): {
  percentage: ComputedRef<number>,
  tooltip: ComputedRef<TooltipOptions>
} => {
  let interval: number

  const state = reactive({ now: unixSeconds() })

  onMounted((): void => {
    interval = window.setInterval(() => { state.now = unixSeconds() }, 1000)
  })

  onUnmounted((): void => {
    if (interval) { window.clearInterval(interval) }
  })

  const percentageLeft = computed(() =>
    Math.floor((completesAt - state.now) * 100 / MAX_SECONDS)
  )

  const percentage = computed(() => {
    return Math.min(Math.max(100 - percentageLeft.value, 0), 100)
  }
  )

  const tooltipMessage = computed(() => {
    // That's an estimation
    const timeLeft = percentageLeft.value / 20
    return timeLeft > 0
      ? `Undo (${timeLeft}s left)`
      : 'Undo'
  })

  const tooltip = computed<TooltipOptions>(() => {
    return {
      content: tooltipMessage.value,
      delay: { show: 0, hide: 300 }
    }
  })

  return { percentage, tooltip }
}
