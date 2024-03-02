<template>
  <table-row :table-id="tableId">
    <table-item
      :table-id="tableId"
      :col="0"
    >
      <rect-content-loader :dimensions="{ width: 34, height: 28 }" />
      <text-content-loader
        class="table-row-content__row-0-text"
        variant="md-2"
        :width="80 + (80 * randomFloatRange(0.1, 0.75))"
      />
    </table-item>
    <table-item
      :table-id="tableId"
      :col="1"
    >
      <circle-content-loader :size="24" />
      <text-content-loader
        class="table-row-content__row-1-text"
        variant="md-2"
        :width="60 + (60 * randomFloatRange(0.1, 0.75))"
      />
    </table-item>
    <table-item
      :table-id="tableId"
      :col="2"
    >
      <text-content-loader
        v-for="n in randomIntRange(1, 4)"
        :key="n"
        class="table-row-content__row-2-text-1"
        variant="md-1"
        :width="30 + (30 * randomFloatRange(0.1, 0.75))"
      />
    </table-item>
    <table-item
      :table-id="tableId"
      :col="3"
    >
      <text-content-loader
        variant="md-2"
        :width="68 + (68 * randomFloatRange(0.1, 0.5))"
      />
    </table-item>
    <table-item
      :table-id="tableId"
      :col="4"
    >
      <text-content-loader
        variant="md-2"
        :width="68 + (68 * randomFloatRange(0.1, 0.5))"
      />
    </table-item>
    <table-item
      :table-id="tableId"
      :col="5"
    >
      <text-content-loader
        variant="md-2"
        :width="38 + (38 * randomFloatRange(0.1, 0.5))"
      />
    </table-item>
  </table-row>
</template>

<script lang='ts'>
import { defineComponent, SetupContext } from 'vue'

import {
  CircleContentLoader,
  RectContentLoader,
  TextContentLoader
} from '@/components/Common/LoadingIndicators'
import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'
import TableRow from '@/components/Common/Table/V2/TableRow/TableRow.vue'

/**
 * @Component TableRowContentLoader
 * ~ TableRowContentLoader usually used to display a loading state for DatasetItemListItem items
 * @param {string} tableId
 * */

export default defineComponent({
  name: 'TableRowContentLoader',
  components: { TableRow, TableItem, RectContentLoader, TextContentLoader, CircleContentLoader },
  props: {
    tableId: {
      type: String,
      required: true
    }
  },
  setup (props, context: SetupContext) {
    const randomIntRange = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }

    const randomFloatRange = (min: number, max: number) => {
      const str = (Math.random() * (max - min) + min).toFixed(2)

      return parseFloat(str)
    }

    return {
      props,
      context,
      randomIntRange,
      randomFloatRange
    }
  }
})
</script>

<style lang='scss' scoped>
.table-row-content__row-0-text {
  margin-left: 10px;
}

.table-row-content__row-1-text {
  margin-left: 8px;
}

.table-row-content__row-2-text-1 {
  &:not(:last-child) {
    margin-right: 2px;
  }
}
</style>
