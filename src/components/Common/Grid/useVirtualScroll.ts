import { chunk } from 'lodash'
import { ref, computed, watch, Ref, SetupContext } from 'vue'
import { DynamicScroller } from 'vue-virtual-scroller'

import { CardRow, GridProps } from '@/components/Common/Grid'

export interface VirtualScrollSetup {
  cardRows: Ref<CardRow[]>
  navigateToInitialItem: () => void
  onResize: () => void
  setInfiniteScroll: () => void
  updateContainerWidth: () => void
  unsetInfiniteScroll: () => void
}

export function useVirtualScroll (
  props: GridProps,
  context: SetupContext,
  containerWidth: Ref<number>,
  dynamicScroller: InstanceType<typeof DynamicScroller>,
  columnCount: Ref<number>
): VirtualScrollSetup {
  const noLoadMore = ref(false)

  const cards = computed(() => {
    if (props.skeletonCount && props.loading) {
      const skeletonItems = []
      for (let i = 0; i < props.skeletonCount; i++) {
        skeletonItems.push({
          id: `skeleton${i}`,
          data: `skeleton${i}`,
          skeleton: true
        })
      }

      return props.items.concat(skeletonItems)
    }
    return props.items
  })

  /**
  * Returns the data collection grouped into rows.
  * In card view mode, we show items as thumbnails, multiple per row,
  * using `RecycleScroller` from the `vue-virtual-scroll` library.
  * To show multiple items per row, we use this function to group the entire
  * collection into rows.
  * We also support zoom, so rows need to be of varied length. The length of
  * each row is computed as part of this function.
  */
  const cardRows = computed(() => {
    const rows: CardRow[] = chunk(cards.value, columnCount.value).map((rowData) => ({
      data: rowData,
      id: `row-${rowData.map((i) => i.id).join('-')}`,
      padding: []
    }))

    const lastRow: CardRow = (rows[rows.length - 1])
    if (lastRow) {
      const paddingCount = columnCount.value - lastRow.data.length
      lastRow.padding = []
      for (let i = 0; i < paddingCount; i++) {
        lastRow.padding.push({ id: i + lastRow.data.length })
      }
    }

    return rows
  })

  const infiniteHandler = (scrollEvent: Event): void => {
    const eventTarget: any = scrollEvent.target
    if (!eventTarget || noLoadMore.value) { return }
    if (eventTarget.scrollTop + eventTarget.clientHeight >= (eventTarget.scrollHeight - 60)) {
      noLoadMore.value = true
      if (props.allowInfiniteScroll) {
        context.emit('infinite-scroll')
      }
    }
  }

  const wheelHandler = (wheelEvent: WheelEvent): void => {
    if (dynamicScroller?.value && wheelEvent.deltaY > 30) {
      const scrollElm = dynamicScroller?.value.$el as HTMLElement
      if (!scrollElm || noLoadMore.value) { return }

      if (scrollElm.clientHeight === scrollElm.scrollHeight) {
        noLoadMore.value = true
        if (props.allowInfiniteScroll) {
          context.emit('infinite-scroll')
        }
      }
    }
  }

  const navigateToInitialItem = (): void => {
    if (!dynamicScroller.value) { return }
    if (!props.initialItemId) { return }

    const index = props.items.findIndex(item => item.id === props.initialItemId)
    if (index < 0) { return }

    dynamicScroller.value.scrollToItem(index)
  }

  const setInfiniteScroll = (): void => {
    if (dynamicScroller?.value) {
      const scrollElm = dynamicScroller?.value.$el as HTMLElement
      if (!scrollElm) {
        // if the scroller is undefined which means still being mounted
        // we need to calculate the container width again.
        setTimeout(() => setInfiniteScroll(), 200)
        return
      }

      scrollElm.addEventListener('scroll', infiniteHandler)
      scrollElm.addEventListener('wheel', wheelHandler)
    }
  }

  const unsetInfiniteScroll = (): void => {
    if (dynamicScroller?.value) {
      const scrollElm = dynamicScroller?.value.$el as HTMLElement
      if (scrollElm) {
        scrollElm.removeEventListener('scroll', infiniteHandler)
        scrollElm.removeEventListener('wheel', wheelHandler)
      }
    }
  }

  const updateContainerWidth = (): void => {
    const scroller = dynamicScroller.value?.$refs?.scroller as Vue
    const wrapper = scroller?.$refs?.wrapper as HTMLElement
    if (!scroller || !wrapper) {
      // if the scroller is undefined which means still being mounted
      // we need to calculate the container width again.
      setTimeout(() => updateContainerWidth(), 200)
      return
    }

    containerWidth.value = wrapper.clientWidth
  }

  const onResize = (): void => {
    updateContainerWidth()
  }

  watch(cardRows, () => {
    updateContainerWidth()
  })

  watch(() => props.items, (items) => {
    if (props.totalCount === 0 || items.length < props.totalCount) {
      noLoadMore.value = false
    }
  })

  watch(() => props.initialItemId, () => {
    navigateToInitialItem()
  }, { immediate: true })

  return {
    cardRows,
    navigateToInitialItem,
    onResize,
    setInfiniteScroll,
    updateContainerWidth,
    unsetInfiniteScroll
  }
}
