<template>
  <div
    :id="id"
    class="table-item__container"
    :style="style"
    v-on="$listeners"
    v-bind="$attrs"
  >
    <div class="table-item__wrapper">
      <div class="table-item__content">
        <slot />
      </div>
    </div>
    <div class="column-resize-area">
      <div class="column-resizer" />
    </div>
  </div>
</template>

<script lang='ts'>
import {
  computed,
  defineComponent,
  Ref
} from 'vue'

import { getElement } from '@/utils/getElement'

export default defineComponent({
  name: 'TableItem',
  props: {
    tableId: {
      required: true,
      type: String
    },
    col: {
      required: true,
      type: Number
    }
  },
  setup (props) {
    const id: Ref<string> = computed(() => {
      return `table-item_${props.tableId}_${props.col}`
    })

    const style: Ref<{ width: string, 'z-index': string } > = computed(() => {
      const referenceEl = getElement(`table-header-column_${props.tableId}_${props.col}`)
      const refWidth = referenceEl ? referenceEl.getBoundingClientRect().width : 100

      return {
        'z-index': `${1000 - props.col}`,
        width: `${refWidth}px`
      }
    })

    return {
      id,
      style
    }
  }
})
</script>

<style lang='scss' scoped>
@import '../table.scss';

.table-item__container {
  position: relative;
  display: block;

  z-index: 1009;

  height: fit-content;
  overflow: hidden;

  background: transparent;

  &:last-child {
    & > div {
      &:last-child {
        display: none;
      }
    }
  }
}

.table-item__wrapper {
  display: block;
}

.table-item__content {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  height: 40px;
  padding: 0px 8px;
}
</style>
