<template>
  <div class="table-row__container">
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableRow',
  props: {
    tableId: {
      type: String,
      required: true
    },
    /*
    * Need row number to generate unique row id for
    * specific elements inside tableRow, e.g RowMenu.vue
    * */
    row: {
      type: Number,
      required: false,
      default: -1
    }
  }
})

</script>

<style lang='scss' scoped>
.table-row__container {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  width: fit-content;
  height: fit-content;

  border-bottom: 1px solid $colorStrokeRaise;
}
</style>
