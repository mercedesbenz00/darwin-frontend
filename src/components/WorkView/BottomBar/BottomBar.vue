<template>
  <div class="bottom-bar">
    <div
      class="bottom-bar__content"
      :class="{'bottom-bar__content--dragging': isDragging}"
    >
      <workflow-filter
        v-if="!tutorialMode"
        class="bottom-bar__content__filter"
        :dataset="dataset"
        :parent-height="carouselHeight"
      />
      <recycle-scroller
        ref="recycleScroller"
        v-dragscroll
        :items="parsedItems"
        key-field="id"
        direction="horizontal"
        class="bottom-bar__content__list"
        :buffer="buffer"
        @dragscrollmove="onDragScrollMove"
        @dragscrollend="onDragScrollEnd"
        @scroll.native.passive="onScroll"
      >
        <template #default="{ item }">
          <div
            v-if="item.id !== requestMoreId"
            role="button"
            class="bottom-bar__content__list__item"
            :style="`width: ${itemSize}px`"
            @click="selectItem(item)"
            @mousewheel="onMouseWheel"
          >
            <slot
              v-if="item.data"
              name="item"
              :item="item"
            />
            <bottom-bar-placeholder
              v-else-if="item.loading"
              :page="item.loading"
            />
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
import { dragscroll } from 'vue-dragscroll'
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { ResizeObserver } from 'vue-resize'
import { RecycleScroller } from 'vue-virtual-scroller'
import { State } from 'vuex-class'

import { BottomBarItem, BottomBarPlaceholder } from '@/components/WorkView/BottomBar'
import { WorkflowFilter } from '@/components/WorkView/WorkflowFilter'
import { DatasetPayload } from '@/store/types'

const DEFAULT_CAROUSEL_HEIGHT = 56

@Component({
  name: 'bottom-bar',
  components: {
    BottomBarPlaceholder,
    WorkflowFilter,
    ResizeObserver
  },
  directives: { dragscroll }
})
export default class BottomBar extends Vue {
  @Prop({ required: true, type: Array as () => BottomBarItem[] })
  items!: BottomBarItem[]

  @Prop({ required: false, default: null, type: Object as () => BottomBarItem })
  selectedItem!: BottomBarItem

  @State(state => state.workview.tutorialMode)
  tutorialMode!: boolean

  @State(state => state.workview.dataset)
  dataset!: DatasetPayload

  $refs!: {
    recycleScroller: InstanceType<typeof RecycleScroller>
  }

  carouselHeight: number = DEFAULT_CAROUSEL_HEIGHT
  requestMoreId: string = '-999'

  // used purely to apply a class to the dragging container, so we can style it
  isDragging: boolean = false;
  onDragScrollMove (event: { deltaX: number }): void {
    if (Math.abs(event.deltaX) > 0) { this.isDragging = true }
  }

  onDragScrollEnd (): void {
    setTimeout(() => (this.isDragging = false), 100)
  }

  get itemSize (): number {
    // the mult's used to keep the 4/3 aspect ratio of the
    // image carousel items
    const mult = this.carouselHeight / DEFAULT_CAROUSEL_HEIGHT
    return (72 + 4) * this.$theme.getCurrentScale() * mult
  }

  get parsedItems (): BottomBarItem[] {
    return this.items
      .map(item => ({ ...item, size: this.itemSize }))
  }

  get buffer (): number {
    const itemsToBuffer = 12
    return this.itemSize * itemsToBuffer * this.$theme.getCurrentScale()
  }

  autoScrolling: boolean = false

  get selectedItemIndex (): number {
    const { selectedItem } = this
    if (!selectedItem) { return -1 }
    return this.items.findIndex(i => i.id === selectedItem.id)
  }

  lastScrolledItemId: string = 'none'

  mounted (): void {
    this.scrollToSelectedItem('auto')
    this.carouselHeight = DEFAULT_CAROUSEL_HEIGHT * this.$theme.getCurrentScale()
  }

  @Watch('selectedItemIndex')
  onSelectedItemIndex (): void {
    this.$nextTick(() => this.scrollToSelectedItem('smooth'))
  }

  @Watch('items')
  onItems (curr: BottomBarItem[], prev: BottomBarItem[]): void {
    if (prev.length === 0) { return }
    // no actual change in length -> no needed change in scroll
    if (curr.length <= prev.length) { return }
    // temporarily different due to attempting preloader at the start of list
    if (curr.length - prev.length === 1 && curr[0].id === 'none') { return }

    const wasAddedToStart = curr[0].id !== prev[0].id
    if (!wasAddedToStart) { return }

    // scroll to previous position
    this.$nextTick(() => this.scrollToSelectedItem('auto'))
  }

  scrollToSelectedItem (behavior: 'auto' | 'smooth'): void {
    const { selectedItemIndex } = this
    if (selectedItemIndex === -1) { return }

    const scroller = this.$refs.recycleScroller
    if (!scroller) { return }

    const scrollerEl = scroller.$el as HTMLElement
    const { scrollLeft, clientWidth } = scrollerEl
    const position = this.selectedItemIndex * this.itemSize
    const leftEdge = scrollLeft
    const rightEdge = scrollLeft + clientWidth
    if (leftEdge < position && rightEdge > position + this.itemSize) { return }

    if (behavior === 'smooth') { this.autoScrolling = true }
    scrollerEl.scrollTo({ left: position, behavior })
  }

  selectItem (item: BottomBarItem): void {
    if (this.isDragging) { return }
    if (!item.data) { return }
    this.$emit('select-item', item)
  }

  onScroll (): void {
    if (this.autoScrolling) {
      this.autoScrolling = false
      return
    }

    const indices = this.getActiveIndices()
    if (!indices) { return }

    const { from, to } = indices
    this.$emit('page-changed', from, to)
  }

  onMouseWheel (event: WheelEvent, behavior: 'auto' | 'smooth'): void {
    if (!event) { return }
    const { deltaY } = event

    const scroller = this.$refs.recycleScroller
    if (!scroller) { return }

    const scrollerEl = scroller.$el as HTMLElement
    const { scrollLeft } = scrollerEl

    scrollerEl.scrollTo({ left: scrollLeft - deltaY, behavior })
  }

  /**
   * Returns start and end index of items currently active in the scroll area
   */
  getActiveIndices (): { from: number, to: number } | null {
    const scroller = this.$refs.recycleScroller
    // scroller not mounted
    if (!scroller) { return null }
    const { $_startIndex: from, $_endIndex: to } = scroller
    return { from, to }
  }
}

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
      @include row;
      width: 100%;
      height: 100%;

      // force showing custom scrollbar
      &:deep(vue-recycle-scroller) {
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
