<template>
  <div class="bottom-bar">
    <div
      class="bottom-bar__content"
      :class="{'bottom-bar__content--dragging': isDragging}"
    >
      <v2-workflow-filter
        v-if="!tutorialMode && dataset"
        class="bottom-bar__content__filter"
        :dataset="dataset"
      />
      <recycle-scroller
        ref="recycleScroller"
        v-dragscroll
        :items="placeholderItems"
        key-field="id"
        direction="horizontal"
        class="bottom-bar__content__list"
        :buffer="buffer"
        emit-update
        @update="onPositionChange"
        @dragscrollmove="onDragScrollMove"
        @dragscrollend="onDragScrollEnd"
        @scroll.native.passive="onScroll"
      >
        <template #default="{ item }">
          <div
            v-if="item.id !== requestMoreIndex"
            role="button"
            class="bottom-bar__content__list__item"
            :style="`width: ${itemSize}px`"
            @click="selectItem(item.id)"
            @mousewheel="onMouseWheel"
          >
            <slot
              v-if="loadedItems[item.id] && loadedItems[item.id].data"
              name="item"
              :item="loadedItems[item.id]"
            />
            <bottom-bar-placeholder v-else />
          </div>
          <slot
            v-else
            name="other"
          />
        </template>
      </recycle-scroller>
      <resize-observer
        emit-on-mounted
        @notify="carouselHeight = $event.height"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick
} from 'vue'
import { dragscroll } from 'vue-dragscroll'
import { ResizeObserver } from 'vue-resize'
import { RecycleScroller } from 'vue-virtual-scroller'

import { BottomBarItemV2, BottomBarPlaceholder } from '@/components/WorkView/BottomBar'
import { V2WorkflowFilter } from '@/components/WorkView/WorkflowFilter'
import { useStore, useTheme, useDatasetItemsLoader } from '@/composables'
import { useItemsReloader } from '@/composables/useItemsReloader'
import { useRoute } from '@/composables/useRouter'

const DEFAULT_CAROUSEL_HEIGHT = 56

export default defineComponent({
  name: 'V2BottomBar',
  components: {
    BottomBarPlaceholder,
    V2WorkflowFilter,
    ResizeObserver
  },
  directives: { dragscroll },
  props: {
    needsMoreWork: { type: Boolean, default: false }
  },
  setup (props, { emit }) {
    const requestMoreIndex = '-999'

    const { state } = useStore()
    const theme = useTheme()
    const route = useRoute()

    const tutorialMode = computed(() => state.workview.tutorialMode)
    const dataset = computed(() => state.workview.dataset)

    // datasetItems - keeps dataset items map (id, item)
    const {
      datasetItems,
      initLoader,
      resolveItemsData,
      resetState
    } = useDatasetItemsLoader(dataset)

    // transform datasetItems map to array to send it to channel subscriber
    const datasetItemsArr = computed(() => Object.values(datasetItems.value))

    // return datasetItems array connected to the sockets
    // and watch for item updates
    const channelSubscriber = useItemsReloader(datasetItemsArr)

    const carouselHeight = ref(DEFAULT_CAROUSEL_HEIGHT)

    const itemSize = computed(() => {
      // the mult's used to keep the 4/3 aspect ratio of the
      // image carousel items
      const mult = carouselHeight.value / DEFAULT_CAROUSEL_HEIGHT
      return (72 + 4) * theme.getCurrentScale() * mult
    })

    const placeholderItems = computed(() => {
      const res = state.dataset.datasetItemIdsV2.map(id => ({
        id,
        size: itemSize.value
      }))

      if (props.needsMoreWork) {
        res.push({
          id: requestMoreIndex,
          size: 140 * theme.getCurrentScale()
        })
      }

      return res
    })

    const loadedItems = ref<{ [key: string]: BottomBarItemV2 }>({})

    watch(() => channelSubscriber.channelDatasetItems.value, (items) => {
      const res: { [key: string]: BottomBarItemV2 } = {}

      items.forEach(item => {
        res[item.id] = { data: item, id: item.id }
      })

      loadedItems.value = res
    }, { immediate: true })

    const recycleScroller = ref<InstanceType<typeof RecycleScroller>>()

    // used purely to apply a class to the dragging container, so we can style it
    const isDragging = ref(false)

    const onDragScrollMove = (event: { deltaX: number }): void => {
      if (Math.abs(event.deltaX) > 0) { isDragging.value = true }
    }
    const onDragScrollEnd = (): void => {
      setTimeout(() => (isDragging.value = false), 100)
    }

    const buffer = computed((): number => {
      const itemsToBuffer = 12
      return itemSize.value * itemsToBuffer * theme.getCurrentScale()
    })

    const autoScrolling = ref(false)

    const selectedItemIndex = computed(() => {
      const selectedItemId = state.workview.selectedDatasetItemV2Id
      if (!selectedItemId) { return -1 }
      return state.dataset.datasetItemIdsV2.indexOf(selectedItemId)
    })

    const scrollToSelectedItem = (behavior: 'auto' | 'smooth'): void => {
      if (selectedItemIndex.value === -1) { return }

      const scroller = recycleScroller.value
      if (!scroller) { return }

      const scrollerEl = scroller.$el as HTMLElement
      const { scrollLeft, clientWidth } = scrollerEl
      const position = selectedItemIndex.value * itemSize.value
      const leftEdge = scrollLeft
      const rightEdge = scrollLeft + clientWidth
      if (leftEdge < position && rightEdge > position + itemSize.value) { return }

      if (behavior === 'smooth') { autoScrolling.value = true }
      scrollerEl.scrollTo({ left: position, behavior })
    }

    watch(selectedItemIndex, () => {
      nextTick(() => {
        scrollToSelectedItem('smooth')
      })
    })

    onMounted(() => {
      nextTick(() => {
        scrollToSelectedItem('auto')
      })
      carouselHeight.value = DEFAULT_CAROUSEL_HEIGHT * theme.getCurrentScale()
    })

    onBeforeUnmount(() => {
      resetState()
    })

    const selectItem = (id: string): void => {
      if (isDragging.value) { return }
      if (!loadedItems.value?.[id]?.data) { return }
      emit('select-item', loadedItems.value?.[id])
    }

    /**
     * Returns start and end index of items currently active in the scroll area
     */
    const getActiveIndices = (): { from: number, to: number } | null => {
      const scroller = recycleScroller.value
      // scroller not mounted
      if (!scroller) { return null }
      const { $_startIndex: from, $_endIndex: to } = scroller
      return { from, to }
    }

    const onScroll = (): void => {
      if (autoScrolling.value) {
        autoScrolling.value = false
        return
      }

      const indices = getActiveIndices()
      if (!indices) { return }

      const { from, to } = indices
      emit('page-changed', from, to)
    }

    const onMouseWheel = (event: WheelEvent, behavior: 'auto' | 'smooth'): void => {
      if (!event) { return }
      const { deltaY } = event

      const scroller = recycleScroller.value
      if (!scroller) { return }

      const scrollerEl = scroller.$el as HTMLElement
      const { scrollLeft } = scrollerEl

      scrollerEl.scrollTo({ left: scrollLeft - deltaY, behavior })
    }

    const onPositionChange = debounce((startIndex: number, endIndex: number): void => {
      const itemId = state.dataset.datasetItemIdsV2[startIndex]
      resolveItemsData(itemId, endIndex - startIndex)
    }, 300)

    const updateItems = debounce(() => {
      // Loads ids for Bottom Bar items list on filter update
      initLoader()
      // On filter update resolve items starting from selected
      resolveItemsData(route.query.item as string)
    }, 300)

    const datasetItemFilter = computed(() => {
      return state.dataset.datasetItemFilterV2
    })

    watch(datasetItemFilter, () => {
      updateItems()
    }, { immediate: true })

    watch(() => route.query?.path, () => {
      updateItems()
    })

    return {
      requestMoreIndex,
      tutorialMode,
      selectItem,
      isDragging,
      carouselHeight,
      dataset,
      onDragScrollMove,
      onDragScrollEnd,
      buffer,
      recycleScroller,
      placeholderItems,
      loadedItems,
      onPositionChange,
      itemSize,
      onScroll,
      onMouseWheel
    }
  }
})
</script>

<style lang="scss" scoped>
.bottom-bar {
  @include row--distributed;
  align-items: center;
  width: 100%;
  height: 100%;
  bottom: 0;
  background-color: $colorNeutralsWhite;
  transition: transform .2s ease-out;

  &__content {
    @include row--distributed;
    align-items: center;
    display: flex;
    height: calc(100% - 8px);
    width: 100%;
    padding: 0 4px;
    background-color: $colorNeutralsWhite;

    &__filter {
      height: 100%;
      padding-right: 4px;
    }

    &__list {
      overscroll-behavior: contain;
      @include row;
      width: 100%;
      height: 100%;

      // force showing custom scrollbar
      &:deep(.vue-recycle-scroller) {
        @include scrollbarV2;
      }

      &__item {
        height: 100%;
        cursor: pointer;
        padding-right: 4px;
      }
    }

    &--dragging {
      &,
      .bottom-bar__content__list__item  {
        cursor: grabbing;
      }
    }
  }
}
</style>
