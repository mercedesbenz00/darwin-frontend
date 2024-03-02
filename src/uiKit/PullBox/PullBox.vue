<template>
  <div
    ref="el"
    @wheel="onWheel"
    class="box"
    :style="{
      transform: transformStyle
    }"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import { defineComponent, ref, onBeforeUnmount, onMounted, computed } from 'vue'

import { getScrollChild } from './helpers'

const ULTIMATE_FORCE = 100

/**
 * Wraps content to trigger pulling up/down events
 * Using the mouse wheel
 */
export default defineComponent({
  name: 'PullBox',
  props: {
    // Allow pull: from down > up
    up: { type: Boolean },
    // Allow pull: from up > down
    down: { type: Boolean },
    // Defines pulling force
    pullForce: { type: Number, default: 0.005 }
  },
  setup (props, { emit }) {
    const el = ref()
    const scrollableElement = ref()
    // false - performes child scroll
    // true - performes PullBox pulling
    let isPullEnabled = false
    // Accumulates pull level using Wheel delta and pull force
    // Where -1 - pulled down
    //        1 - pulled up
    const pullLevel = ref(0)
    const transformStyle = computed(() => `translateY(${pullLevel.value * -20}px)`)

    // Reset pulling state with debounce
    const resetDebounce = debounce(() => { pullLevel.value = 0 }, 100)

    const enablePull = (): void => {
      isPullEnabled = true
    }
    const enablePullDebounce = debounce(enablePull, 40)

    const disablePull = (): void => {
      isPullEnabled = false
      pullLevel.value = 0
    }

    const pull = (e: WheelEvent): void => {
      // Calculate current pull level
      pullLevel.value += e.deltaY * -props.pullForce

      const min = props.down ? -1 : 0
      const max = props.up ? 1 : 0
      pullLevel.value = Math.min(Math.max(min, pullLevel.value), max)

      // Reach top
      if (pullLevel.value === 1) {
        emit('up')
      }
      // Reach bottom
      if (pullLevel.value === -1) {
        emit('down')
      }

      // On idle reset pulling
      resetDebounce()
    }

    // Disables pulling on child scroll.
    // Prevents unwanted pulling.
    const onChildScroll = (): void => {
      disablePull()
    }

    // Add scroll event listener for scrollable child
    const initScrollableElement = (): void => {
      scrollableElement.value = getScrollChild(el.value)

      if (!scrollableElement.value) { return }

      scrollableElement.value.addEventListener('scroll', onChildScroll)
    }

    const observer = new MutationObserver(() => {
      initScrollableElement()
    })

    onMounted(() => {
      initScrollableElement()

      // Watch for slots DOM element change
      observer.observe(
        el.value.children[0],
        { subtree: true, childList: true }
      )
    })

    onBeforeUnmount(() => {
      scrollableElement.value?.removeEventListener('scroll', onChildScroll)
      observer.disconnect()
    })

    const onWheel = (e: WheelEvent): void => {
      if (!scrollableElement.value) {
        initScrollableElement()
        return
      }

      const { scrollTop, clientHeight, scrollHeight } = scrollableElement.value

      // Scrollable child at the very top level
      if (props.up && scrollTop <= 0) {
        if (Math.abs(e.deltaY) > ULTIMATE_FORCE) {
          // Applying ultimate force enables pulling
          enablePull()
        } else {
          // Scrolling up after debounces delay enables pulling
          enablePullDebounce()
        }
      }
      // Scrollable child at the very bottom level
      if (props.down && (scrollTop + clientHeight) >= scrollHeight) {
        if (Math.abs(e.deltaY) > ULTIMATE_FORCE) {
          // Applying ultimate force enables pulling
          enablePull()
        } else {
          // Scrolling down after debounces delay enables pulling
          enablePullDebounce()
        }
      }

      // Performs pulling if enabled
      if (isPullEnabled) {
        pull(e)
      }
    }

    return {
      el,
      transformStyle,
      onWheel
    }
  }
})
</script>

<style lang="scss" scoped>
.box {
  transition: transform .3s linear;
  will-change: transform;
}
</style>
