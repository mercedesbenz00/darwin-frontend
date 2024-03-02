<template>
  <div
    class="table-header__container"
    :id="`table-root_${id}`"
  >
    <table-header-column
      v-for="(item, index) in items"
      :table-id="id"
      :id="`table-header-column_${id}_${index}`"
      :total-items="items.length"
      :key="`${index}-${item.label}`"
      :label="item.label"
      :min-column-size="item.minColumnSize"
      :sort-action="item.sortAction"
      :position="index"
      resizeable
      v-on="$listeners"
    />
    <row-menu
      :table-id="id"
      :is-item="false"
      :row="-1"
    />
  </div>
</template>

<script lang='ts'>
import {
  defineComponent,
  PropType
} from 'vue'

import RowMenu from '@/components/Common/Table/V2/RowMenu/RowMenu.vue'
import TableHeaderColumn
  from '@/components/Common/Table/V2/TableHeaderColumn/TableHeaderColumn.vue'

import { TableHeaderProps } from './types'

export default defineComponent({
  name: 'TableHeader',
  components: {
    RowMenu,
    TableHeaderColumn
  },
  props: {
    id: {
      required: true,
      type: String as PropType<TableHeaderProps['id']>
    },
    items: {
      required: true,
      type: Array as () => TableHeaderProps['items']
    }
  }
})
</script>

<style lang='scss' scoped>
.table-header__container {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  width: fit-content;
  border-bottom: 1px solid $colorStrokeRaise;
  background-color: $colorNeutralsLightWhite;

  & > button {
    position: sticky;
    top: 0;
    right: 0;
    margin-left: 0.25px;
  }
}
</style>
