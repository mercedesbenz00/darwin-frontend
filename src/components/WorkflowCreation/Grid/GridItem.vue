<template>
  <vue-draggable-resizable
    ref="el"
    :id="id"
    :resizable="false"
    :h="stageHeight"
    :w="stageWidth"
    :z="selected ? Z_INDEX_SELECTED : Z_INDEX_DEFAULT"
    :active="selected"
    :scale="scale"
    class="grid-item"
    :x="gridX"
    :y="gridY"
    :grid="[cellWidth, cellHeight]"
    @dragging="onDragging"
    @dragstop="onDragstop"
    @activated="$emit('activated')"
    prevent-deactivation
  >
    <slot :dragging="dragging" />
  </vue-draggable-resizable>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import {
  defineComponent,
  ref,
  computed,
  nextTick,
  onMounted,
  onUnmounted
} from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

import { useGridStore } from './useGridStore'

export default defineComponent({
  name: 'GridItem',
  components: {
    VueDraggableResizable
  },
  props: {
    id: { type: String, required: true },
    selected: { default: false, required: false, type: Boolean },
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  setup (props, { emit }) {
    const el = ref()

    const gridStore = useGridStore()
    if (!gridStore) { throw new Error("Can't get grid store!") }

    const {
      scale,
      setBBox,
      cellWidth,
      cellHeight,
      itemFocus,
      itemBlur,
      unregister
    } = gridStore

    const itemBlurDebounce = debounce(() => itemBlur(), 10)

    const gridX = computed(() =>
      props.x - (props.x % cellWidth)
    )

    const gridY = computed(() =>
      props.y - (props.y % cellHeight)
    )

    const pushBBoxToParent = debounce((x = gridX.value, y = gridY.value): void => {
      nextTick(() => {
        setBBox(
          props.id,
          {
            x,
            y,
            width: el.value?.$el?.clientWidth,
            height: el.value?.$el?.clientHeight
          }
        )
      })
    }, 50)

    onUnmounted(() => unregister(props.id))

    onMounted(() => {
      pushBBoxToParent()
    })

    const stageHeight = 'auto'
    const stageWidth = 240

    const Z_INDEX_SELECTED = 1005
    const Z_INDEX_DEFAULT = 1004

    const dragging = ref(false)

    const onDragging = (x: number, y: number): void => {
      dragging.value = true
      itemFocus()
      pushBBoxToParent(x, y)
      emit('dragging', { x, y })
      itemBlurDebounce()
    }

    const onDragstop = (): void => {
      dragging.value = false
      emit('drag-end')
    }

    return {
      scale,
      el,
      stageHeight,
      stageWidth,
      Z_INDEX_DEFAULT,
      Z_INDEX_SELECTED,
      gridX,
      gridY,
      cellWidth,
      cellHeight,
      dragging,
      onDragging,
      onDragstop
    }
  }
})
</script>

<style lang="scss" scoped>
.grid-item {
  position: absolute;
  display: block;

  background: $colorNeutralsLightWhite;
  box-shadow: $shadowLightXS;
  border-radius: 12px;
  border: none;

  z-index: var(--z-index-stage-container);

  max-height: 435px;
}
</style>
