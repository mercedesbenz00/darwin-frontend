<template>
  <div
    class="grid"
  >
    <div
      class="grid__content grid__content--card-mode"
    >
      <template v-if="!loading && items.length === 0">
        <slot
          v-if="$slots.emptyContent"
          name="emptyContent"
        />
        <div
          v-else
          class="grid__content__no-data"
        >
          {{ emptyMessage }}
        </div>
      </template>
      <dynamic-scroller
        v-else
        ref="dynamicScroller"
        class="grid__content__scroll-container grid__content__scroll-container--card"
        key-field="id"
        :buffer="2500"
        :min-item-size="minCardHeight + (2 * cardMarginTB)"
        :items="cardRows"
      >
        <template #default="{ item: row, active, index: rowIndex }">
          <dynamic-scroller-item
            v-if="row.data && row.data.length > 0"
            class="grid__content__scroll-container__row"
            :item="row"
            :size-dependencies="[row.data]"
            :active="active"
            :data-index="rowIndex"
          >
            <div
              v-for="(item, index) of row.data"
              :key="`card${item.id}`"
              class="grid-card"
              :class="{ 'grid-card--active': active }"
              :style="{
                width: `${cardWidth}px`,
                margin: `${cardMarginTB}px ${cardMarginLR}px`
              }"
            >
              <slot
                v-if="item.skeleton"
                name="skeleton"
                :item="item"
                :index="rowIndex * columnCount + index"
              />
              <slot
                v-else
                name="card"
                :item="item"
                :index="rowIndex * columnCount + index"
              />
            </div>
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
    </div>
    <resize-observer @notify="onResize" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
  onBeforeUnmount,
  onMounted,
  PropType,
  SetupContext
} from 'vue'
import { ResizeObserver } from 'vue-resize'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-resize/dist/vue-resize.css'

import { GridItem, GridProps, SizeStep } from './types'
import { useResponsive } from './useResponsive'
import { useVirtualScroll } from './useVirtualScroll'

export default defineComponent({
  name: 'Grid',
  components: { DynamicScroller, DynamicScrollerItem, ResizeObserver },
  props: {
    items: {
      required: true,
      type: Array as PropType<GridItem[]>
    },
    loading: {
      required: false,
      type: Boolean,
      default: false
    },
    initialItemId: {
      required: false,
      type: String,
      default: ''
    },
    emptyMessage: {
      required: false,
      type: String,
      default: 'No data has been added yet'
    },
    sizeStep: {
      required: false,
      type: String as PropType<SizeStep>,
      default: SizeStep.md
    },
    cardMarginTB: {
      required: false,
      type: Number,
      default: 2
    },
    cardMarginLR: {
      required: false,
      type: Number,
      default: 4
    },
    allowInfiniteScroll: {
      required: false,
      type: Boolean,
      default: false
    },
    totalCount: {
      required: false,
      type: Number,
      default: 0
    },
    skeletonCount: {
      required: false,
      type: Number,
      default: 0
    }
  },
  setup (props: GridProps, context: SetupContext) {
    const containerWidth = ref(0)
    const dynamicScroller: InstanceType<typeof DynamicScroller> = ref(null)
    const gridResponsive = useResponsive(props, containerWidth)
    const virtualScroller = useVirtualScroll(props, context, containerWidth,
      dynamicScroller, gridResponsive.columnCount)

    onMounted(() => {
      virtualScroller.updateContainerWidth()
      setTimeout(virtualScroller.navigateToInitialItem, 500)
    })

    watch(dynamicScroller, (cur, prev) => {
      // When Grid component loaded, initially dynamicScroller is null for some duration
      // Should to set infinite scroll after dynamicScroller has valid ref.
      if (!(prev == null && cur)) { return }
      if (!props.allowInfiniteScroll) { return }
      
      virtualScroller.setInfiniteScroll()
    })

    onBeforeUnmount(() => {
      if (props.allowInfiniteScroll) {
        virtualScroller.unsetInfiniteScroll()
      }
    })

    return {
      dynamicScroller,
      ...gridResponsive,
      ...virtualScroller
    }
  }
})
</script>

<style lang="scss" scoped>
.grid {
  width: 100%;
  height: 100%;
  margin: 0;
  @include col;
}

.grid__content {
  width: 100%;
  height: 100%;
}

.grid__content__no-data {
  @include row--center;
  @include typography(lg, headlines, bold);
  width: 100%;
  height: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.grid__content__scroll-container {
  width: 100%;
  height: 100%;
  min-height: 64px;
  overflow: hidden auto;
  @include scrollbarV2;

  :deep(.vue-recycle-scroller__item-wrapper) {
    width: calc(100% - 8px) !important;
    margin: 4px 4px;
    overflow: visible;
  }
}

.grid__content--card-mode {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-between;
  align-content: baseline;
}

.grid__content__scroll-container__row {
  display: flex;
  justify-content: flex-start;
}
</style>
