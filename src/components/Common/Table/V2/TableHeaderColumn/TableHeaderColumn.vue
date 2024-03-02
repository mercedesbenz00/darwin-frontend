<template>
  <div
    class="column-head__container"
    :style="style"
  >
    <button
      class="column-head__wrapper"
      @click="onColumnClick"
    >
      <div class="column-head__content">
        <h1 class="column-head__label">
          {{ label }}
        </h1>
        <sort-icon
          ref="sort-table"
          v-if="!!sortAction"
          :mode="mode"
        />
      </div>
    </button>
    <div
      class="column-resize-area"
      @mousedown="onMouseDown"
      :class="{ 'column-resize-area--disabled': !resizeable }"
    >
      <div class="column-resizer" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  onBeforeUnmount,
  onMounted,
  PropType,
  Ref
} from 'vue'

import { TableHeaderItem } from '@/components/Common/Table/V2/TableHeader'

import { SortIcon, SortMode } from './SortIcon'

export default defineComponent({
  name: 'TableHeaderColumn',
  components: {
    SortIcon
  },
  props: {
    tableId: {
      required: true,
      type: String as PropType<TableHeaderItem['tableId']>
    },
    totalItems: {
      required: true,
      type: Number as PropType<TableHeaderItem['totalItems']>
    },
    label: {
      required: true,
      type: String as PropType<TableHeaderItem['label']>
    },
    sortAction: {
      required: false,
      type: Function as PropType<TableHeaderItem['sortAction']>,
      default: null
    },
    minColumnSize: {
      required: true,
      type: Number as PropType<TableHeaderItem['minColumnSize']>
    },
    resizeable: {
      required: false,
      type: Boolean as PropType<TableHeaderItem['resizeable']>,
      default: false
    },
    position: {
      required: true,
      type: Number
    }
  },
  setup (props, { emit }) {
    const initialX = ref(0)
    const startWidth = ref(0)
    const columnWidth: Ref<number | null> = ref(null)
    const mode: Ref<SortMode> = ref(SortMode.DESC)

    const fillEmptySpace = (): void => {
      const tableParent = document.getElementById(`table-${props.tableId}`) as HTMLElement | null
      if (!tableParent) { return }
      const { width } = tableParent?.getBoundingClientRect()

      /*
      * Fills empty space on resize. Useful for higher res screens. First element is always 25% of
      * parents width, all other childs sharing 75% of the total left space
      * With (40 / this.totalItems + 0.25) we subtract the list element width from total width
      * */
      if (props.position === 0) {
        columnWidth.value = (0.25 * width) - (40 / props.totalItems + 0.25)
      } else {
        columnWidth.value = (0.75 / (props.totalItems - 1) * width) - (40 / props.totalItems + 0.25)
      }

      emit('on-resize', { columnPosition: props.position, width: columnWidth.value })
    }

    onMounted(() => {
      columnWidth.value = props.minColumnSize
      fillEmptySpace()

      window.addEventListener('resize', fillEmptySpace)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', fillEmptySpace)
    })

    const style: Ref<{ width: string; }> = computed(() => {
      return {
        width: `${columnWidth.value || props.minColumnSize}px`
      }
    })

    const onColumnClick = (): void => {
      if (!props.sortAction) { return }

      mode.value = mode.value === SortMode.DESC ? SortMode.ASC : SortMode.DESC

      props.sortAction(mode.value)
      emit('on-sort', { mode: mode.value })
    }

    const onResize = (e: MouseEvent): void => {
      const newWidth = startWidth.value + e.clientX - initialX.value
      const maxWidth = 650
      const minWidth = 125

      columnWidth.value = newWidth >= maxWidth
        ? maxWidth
        : newWidth <= minWidth ? minWidth : newWidth

      emit('on-resize', { columnPosition: props.position, width: columnWidth.value })
    }

    const onMouseUp = (): void => {
      document.body.removeEventListener('mousemove', onResize)
      document.body.removeEventListener('mouseup', onMouseUp)
    }

    const onMouseDown = (e: MouseEvent): void => {
      if (!props.resizeable) { return }

      initialX.value = e.clientX
      startWidth.value = columnWidth.value || props.minColumnSize

      document.body.addEventListener('mousemove', onResize)
      document.body.addEventListener('mouseup', onMouseUp)
    }

    return {
      mode,
      style,
      onColumnClick,
      onMouseDown
    }
  }
})
</script>

<style lang="scss" scoped>
.column-head__container {
  position: relative;
  display: block;
  height: fit-content;

  &:last-child {
    & > div {
      &:last-child {
        display: none;
      }
    }
  }
}

.column-head__wrapper {
  transition: background 175ms ease, width 75ms ease;

  display: block;
  background: $colorSurfaceDefault;
  width: 100%;
  height: fit-content;

  margin: 0;
  padding: 0;

  &:hover {
    background: $colorOverlayHover;
  }

  &:active {
    background: $colorOverlayPressed;
  }
}

.column-head__content {
  display: grid;
  grid-template-columns: 1fr 20px;
  align-items: center;
  height: 32px;

  padding: 0 8px;
}

.column-head__label {
  @include typography(md, inter, 500);
  @include ellipsis(1, md);

  text-align: left;
  color: $colorContentSecondary;
  margin-right: 2px;
}

.column-resize-area {
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  top: 0px;
  right: -10px;
  width: 20px;
  height: 100%;
  background: transparent;

  cursor: col-resize;

  &:hover {
    & > div {
      width: 2px;
      background: $colorInteractivePrimaryDefault;
    }
  }

  &--disabled {
    &:hover {
      cursor: pointer;

      & > div {
        width: 1px;
        background: $colorStrokeRaise;
      }
    }
  }
}

.column-resizer {
  transition: all 150ms ease;

  display: block;
  width: 1px;
  border-radius: 100px;
  height: 100%;
  background: $colorStrokeRaise;
}
</style>
