<template>
  <div
    ref="rootEl"
    class="segmented-control"
    :class="`segmented-control--${variant}`"
    :style="`grid-template-columns: repeat(${tabs.length}, 1fr)`"
  >
    <div
      class="segmented-control__block"
      :class="`segmented-control__block--${variant}`"
      :style="{
        ['left']: `${startVisualOffset}px`,
        ['--blockWidth']: `${blockWidth}px`,
        ['transform']: `translateX(${blockPosition}px)`
      }"
    />
    <tab
      v-for="(tab, index) in tabs"
      :key="tab.id"
      :id="tab.id"
      :icon-name="tab.iconName"
      :label="tab.label"
      :variant="variant"
      :active="index === currentIndex"
      @click.native="onTab(index, $event)"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  Ref,
  onMounted,
  computed,
  onBeforeUnmount
} from 'vue'

import Tab from './Tab/Tab.vue'
import { SegmentedControl as Type, SegmentedControlVariant } from './types'

/**
 * @Component SegmentedControl
 * ~ Component to toggle multiple states in a bar.
 * We use DOM manipulation below to calculate the moving active block. To reset the animation we
 * have implemented an offset which sets the initial start position of the active block element to
 * the passed index.
 * To achieve the animation reset we use the CSSProperty 'left' as offset and 'transform' to move.
 * @param {object[]} tabs
 * @param {number} activeIndex used to set the active bar initially to the active 
 * state/item logical and visual
 * */

export default defineComponent({
  name: 'SegmentedControl',
  components: { Tab },
  props: {
    id: {
      type: String,
      required: true
    },
    tabs: {
      type: Array as () => Type['tabs'],
      required: true
    },
    variant: {
      type: String,
      default: SegmentedControlVariant.SMALL
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },
  setup (props, { emit }) {
    const rootEl: Ref<HTMLDivElement | null> = ref(null)
    const currentIndex: Ref<number> = ref(0)
    const padding = {
      left: 3,
      right: 3
    }
    const blockWidth: Ref<number> = ref(0)

    const calcBlockWidth = (rootEl: HTMLDivElement | null): void => {
      const rootWidth =
        (rootEl?.getBoundingClientRect().width || 0) - (padding.left + padding.right)

      blockWidth.value = rootWidth / props.tabs.length
    }

    onMounted(() => {
      currentIndex.value = props.activeIndex || 0

      if (props.variant === SegmentedControlVariant.LARGE) {
        padding.left = 4
        padding.right = 4
      }

      if (rootEl.value) {
        calcBlockWidth(rootEl.value)
      }

      window.addEventListener('resize', () => {
        if (!rootEl.value) { return }
        calcBlockWidth(rootEl.value)
      })
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', () => {
        if (!rootEl.value) { return }
        calcBlockWidth(rootEl.value)
      })
    })

    const onTab = (index: number, e: MouseEvent): void => {
      currentIndex.value = index
      emit(
        'tabChange',
        {
          index,
          tab: props.tabs[index]
        },
        e
      )
    }

    const startOffset = computed(() => {
      return blockWidth.value * (props.activeIndex || 0)
    })

    const startVisualOffset = computed(() => {
      const offset = blockWidth.value * (props.activeIndex || 0) + padding.left

      return offset
    })

    const blockPosition = computed(() => {
      return blockWidth.value * currentIndex.value - startOffset.value
    })

    return {
      onTab,
      currentIndex,
      blockWidth,
      startOffset,
      startVisualOffset,
      blockPosition
    }
  }
})
</script>

<style lang="scss" scoped>
.segmented-control {
  position: relative;

  display: grid;
  align-items: center;

  background: $colorSurfaceRaise;
  width: 100%;

  &--small {
    border-radius: 8px;
    padding: 3px;
    height: 32px;
  }

  &--large {
    border-radius: 10px;
    padding: 4px;
    height: 36px;
  }
}

.segmented-control__block {
  transition: transform 175ms linear;

  position: absolute;
  top: 0;

  display: block;
  width: var(--blockWidth, 0);
  background: red;
  border-radius: 5px;

  &--small {
    top: 3px;
    left: 3px;
    height: 26px;
  }

  &--large {
    top: 4px;
    left: 4px;
    height: 28px;
  }

  box-shadow: $effectShadowsXS;
  background: $colorSurfaceDefault;

  z-index: 0;
}
</style>
