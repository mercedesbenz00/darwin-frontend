<template>
  <div class="model-list-header">
    <div
      v-for="(column, index) in columns"
      :key="index"
      class="model-list-header__column"
      :class="`model-list-header__${column.name}`"
      @click="sortBy(column.name)"
    >
      <div>{{ column.text }}</div>
      <sort-arrow
        :selected="column.selected"
        :order="column.order"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import SortArrow from '@/components/Common/SortArrow/SortArrow.vue'

type Column = {
  name: string
  order: 'ascending' | 'descending'
  selected: boolean
  text: string
}

@Component({ name: 'model-list-header', components: { SortArrow } })
export default class ModelListHeader extends Vue {
  columns: Column[] = [
    { name: 'name', text: 'Model Name', selected: true, order: 'ascending' },
    { name: 'type', text: 'Model Type', selected: false, order: 'ascending' },
    { name: 'dataset', text: 'Dataset', selected: false, order: 'ascending' },
    { name: 'date', text: 'Date', selected: false, order: 'ascending' },
    { name: 'status', text: 'Status', selected: false, order: 'ascending' }
  ]

  sortBy (columnName: string): void {
    const column = this.columns.find(column => column.name === columnName)
    if (!column) { return }
    if (column.selected) {
      // If column is already selected, sort the same column in ascending order
      column.order = column.order === 'ascending' ? 'descending' : 'ascending'
    } else {
      column.order = 'ascending'
      this.selectColumn(column)
    }
    this.$emit('sort', column.name, column.order)
  }

  selectColumn (column: Column): void {
    for (const column of this.columns) { column.selected = false }
    column.selected = true
  }
}
</script>

<style lang="scss" scoped>
@import './modelListItem.scss';

.model-list-header {
  @include modelListItem;
}
</style>
