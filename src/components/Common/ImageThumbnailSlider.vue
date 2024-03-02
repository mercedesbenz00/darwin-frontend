<template>
  <div class="thumb_slide">
    <button
      class="thumb_slide__navigation thumb_slide__navigation--prev"
      :disabled="isPrevDisabled"
      @click="$emit('prev')"
    >
      ◀
    </button>
    <div
      ref="imageCarousel"
      class="thumb_slide__carousel"
    >
      <recycle-scroller
        ref="recycleScroller"
        v-dragscroll
        :buffer="2000"
        :item-size="scaledItemSize"
        :items="items"
        class="thumb_slide__carousel-container"
        direction="horizontal"
        key-field="id"
        @dragscrollend="onDragScrollEnd"
      >
        <template #default="{ item, index }">
          <slot
            name="item"
            :item="item"
            :index="index"
          />
        </template>
      </recycle-scroller>
    </div>
    <button
      class="thumb_slide__navigation thumb_slide__navigation--next"
      :disabled="isNextDisabled"
      @click="$emit('next')"
    >
      ▶
    </button>
  </div>
</template>

<script lang="ts">
import { dragscroll } from 'vue-dragscroll'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'

type Item = Record<string, any> & { id: number | string }

@Component({
  name: 'image-thumbnail-slider',
  directives: { dragscroll }
})
export default class ImageThumbnailSlider extends Vue {
  @Prop({ required: true })
  items!: Item[];

  @Prop({ required: false, type: Object as () => Item | null })
  selectedItem!: Item | null;

  get selectedIndex (): number {
    const { items, selectedItem } = this
    if (!selectedItem) { return -1 }
    return items.findIndex(i => i.id === selectedItem.id)
  }

  // navigation

  /**
   * By default, the component will disable the prev/next buttons when at the
   * edge of the item list.
   *
   * This prop overrides that behavior and leaves the buttons enabled.
   *
   * The use case could be to, for example, handle prev/next events to laod more
   * items.
   */
  @Prop({ required: false, default: true })
  disableNavOnEdge!: boolean

  get isPrevDisabled (): boolean {
    const { disableNavOnEdge, selectedIndex } = this
    return disableNavOnEdge && selectedIndex - 1 < 0
  }

  get isNextDisabled (): boolean {
    const { disableNavOnEdge, selectedIndex, items } = this
    return disableNavOnEdge && selectedIndex + 1 >= items.length
  }

  mounted () {
    // The reason why it has been implemented with setTimeout
    // is because the RecycleScroller component needs a nick of time
    // to load the whole set of images before being able to scrolling
    // to any item.
    setTimeout(() => {
      this.scrollToNearestIndex()
    }, 500)
  }

  @Watch('selectedIndex')
  onSelectedItemChange () {
    this.$nextTick(() => {
      this.scrollToNearestIndex()
    })
  }

  // handle dragscroll behavior

  onDragScrollEnd (): void {
    this.$nextTick(() => this.snapToFullItem())
  }

  // scrolling helpers

  $refs!: Vue['$refs'] & {
    imageCarousel: HTMLDivElement
    recycleScroller: InstanceType<typeof RecycleScroller>
  }

  scrollToItem (index: number = 0): void {
    this.$refs.recycleScroller.scrollToItem(index)
  }

  /**
   * Snaps carousel to the first item, from the left,
   * which is less than half way out of view.
   *
   * If the carousel has 5 items and user has dragged so less then half of the
   * second item is visible on the left edge, it will snap so item 3 is the
   * first item.
   *
   * If, on the other had, more than half of item 2 is still visible, it will
   * snap so item 2 is the first item.
   */
  snapToFullItem (): void {
    const { scaledItemSize } = this

    const curScrollLeft: number = this.$refs.recycleScroller.$el.scrollLeft
    const modScroll = curScrollLeft % scaledItemSize
    const ratio = curScrollLeft / scaledItemSize

    if (modScroll <= scaledItemSize / 2) {
      this.$refs.recycleScroller.scrollToItem(Math.floor(ratio))
    } else {
      this.$refs.recycleScroller.scrollToItem(Math.ceil(ratio))
    }
  }

  /**
   * Snaps to closest fully visible item, if the currently selected item is not
   * fully visible.
   *
   * If there's room (selected item is at least 2nd in the list), it snaps so
   * the selected item becoms the second rendered item from the left.
   *
   * If the currently selected item is already fully visible, it does nothing.
   *
   * In practic, this will only do something if the selected item is rendred so
   * it's partially visible.
   */
  scrollToNearestIndex (): void {
    const { selectedIndex: idx } = this
    if (idx === -1) { return }
    if (this.isItemFullyVisible(idx)) { return }
    if (idx >= 2 && this.isItemFullyVisible(idx - 2)) {
      this.scrollToItem(idx - 2)
      return
    }
    if (idx >= 1 && this.isItemFullyVisible(idx - 1)) {
      this.scrollToItem(idx - 1)
      return
    }
    this.scrollToItem(idx)
  }

  isItemFullyVisible (idx: number) {
    const { scaledItemSize } = this
    const curScrollLeft = this.$refs.recycleScroller.$el.scrollLeft
    const minScrollLeft = scaledItemSize * (idx - 2)
    const maxScrollLeft = scaledItemSize * idx
    return minScrollLeft <= curScrollLeft && curScrollLeft <= maxScrollLeft
  }

  // item size, with auto-scaling

  @Prop({ required: false, default: 64, type: Number })
  itemSize!: number

  get scaledItemSize () {
    return this.itemSize * this.$theme.getCurrentScale()
  }
}

</script>

<style lang="scss" scoped>
.thumb_slide {
  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  justify-content: start;
  column-gap: 8px;
  width: 100%;
  height: 100%;
  transition: transform .2s ease-out;
}

.thumb_slide__carousel {
  display: flex;
  flex: auto;
  height: 100%;
  width: 100%;

  // prevents grid blowout
  min-width: 1px;
}

// Positions vue-recycle-scroller and the items it renders correctly. Needs to be used unscoped
.thumb_slide__carousel :deep(.thumb_slide__carousel-container) {
  // additional margin to the left and right of all the items
  margin: 0 2px;

  @include hidden-scrollbar;

  .vue-recycle-scroller__item-view {
    // creates spacing between individual thumbnails
    padding: 0;
    @include row--center;
  }

  // switch cursor to grabbing on drag (used with vue-dragscroll)
  &:active { cursor: grabbing; }
}

.thumb_slide__navigation {
  font-family: "system";
  padding: 0;

  &:disabled {
    color: $colorGrayLite;
  }
}

</style>
