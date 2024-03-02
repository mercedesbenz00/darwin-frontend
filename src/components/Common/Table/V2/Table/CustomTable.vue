<template>
  <div
    class="table"
    v-if="!!headerRow"
    :id="`table-${tableId}`"
  >
    <div class="table__container">
      <table-header
        :id="tableId"
        :items="headerRow"
        @on-resize="onResize"
      />
      <div class="table__wrapper">
        <recycle-scroller
          v-if="data"
          ref="recycleScroller"
          class="scroller"
          :items="data"
          :item-size="40"
          key-field="id"
          use-relative-positioning
          @scroll.native.passive="usesInfiniteScroll && handleScroll($event)"
        >
          <template #default="{ item, index, active }">
            <slot
              :item="item"
              :index="index"
              :active="active"
            />
          </template>
        </recycle-scroller>
        <slot
          v-else
          name="loading"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'

import colors from '@/assets/styles/darwin/variables/colors.module.scss'
import { TableProps } from '@/components/Common/Table/V2/Table/types'
import { TableHeader } from '@/components/Common/Table/V2/TableHeader'
import TableHeaderColumn from '@/components/Common/Table/V2/TableHeaderColumn/TableHeaderColumn.vue'
import TableItem from '@/components/Common/Table/V2/TableItem/TableItem.vue'
import TableRow from '@/components/Common/Table/V2/TableRow/TableRow.vue'

@Component({
  name: 'custom-table',
  components: {
    TableHeader,
    TableHeaderColumn,
    TableItem,
    TableRow
  }
})
export default class CustomTable extends Vue {
  @Prop({ required: true, type: String })
  tableId!: TableProps['tableId']

  @Prop({ required: true, type: Array as () => TableProps['data'] })
  data!: TableProps['data']

  @Prop({ required: true, type: Array as () => TableProps['headerRow'] })
  headerRow!: TableProps['headerRow']

  @Prop({ required: false, type: Boolean, default: false })
  usesInfiniteScroll!: boolean

  $refs!: Vue['$refs'] & {
    recycleScroller: InstanceType<typeof RecycleScroller>
  }

  mounted (): void {
    this.headerRow.forEach(({ minColumnSize }, index) => {
      this.onResize({ columnPosition: index, width: minColumnSize })
    })
  }

  handleScroll (e: Event & { target: HTMLDivElement }) {
    const LOAD_THRESHOLD_PX = 50

    const { target } = e

    const currentScroll = target.scrollTop
    const scrollableDistance = Math.max(0, target.scrollHeight - target.offsetHeight)

    if (currentScroll >= scrollableDistance - LOAD_THRESHOLD_PX) {
      this.$emit('load-data')
    }
  }

  fillsContainer (): boolean {
    const container = this.$el.getBoundingClientRect()
    const wrapper = Array.from(this.$el.children)[0].getBoundingClientRect()

    return wrapper.width >= container.width
  }

  onResize (args: { columnPosition: number, width: number }): void {
    /**
     * Logic to toggle container, wrapper and row menu border conditionally to
     * have a pixel perfect design/ui result
     */
    const rowMenu =
      Array.from(document.querySelectorAll<HTMLDivElement>(`[id="row-menu-${this.tableId}"]`))
    if (this.fillsContainer()) {
      (this.$el as HTMLDivElement).style.borderRight = `1px solid ${colors.colorStrokeRaise}`;
      (Array.from(this.$el.children)[0] as HTMLDivElement).style.borderRight = 'none'
      if (rowMenu) {
        rowMenu.forEach(el => {
          el.style.borderLeft = `1px solid ${colors.colorStrokeRaise}`
        })
      }
    } else {
      (this.$el as HTMLDivElement).style.border = 'none';

      (Array.from(this.$el.children)[0] as HTMLDivElement).style.borderRight =
        `1px solid ${colors.colorStrokeRaise}`

      if (rowMenu) {
        rowMenu.forEach(el => {
          el.style.borderLeft = 'none'
        })
      }
    }

    const contentColumnsInSpecificRow = Array.from(
      document.querySelectorAll(`[id="table-item_${this.tableId}_${args.columnPosition}"]`)
    ) as HTMLDivElement[]

    contentColumnsInSpecificRow.forEach(el => {
      el.style.width = `${args.width}px`
    })
  }
}
</script>

<style lang="scss" scoped>
.table {
  position: relative;

  display: inline-block;
  background: $colorSurfaceElevate;

  width: 100%;
  height: 100%;
  overflow-y: hidden;

  @include hidden-scrollbar;
}

.table__container {
  display: block;

  border: 1px solid $colorStrokeRaise;
  width: fit-content;
  height: 100%;
}

.table__wrapper {
  height: calc(100% - 33px);
  background-color: $colorNeutralsLightWhite;

  @include hidden-scrollbar;
}

.scroller {
  max-height: 100%;

  @include hidden-scrollbar;
}
</style>
