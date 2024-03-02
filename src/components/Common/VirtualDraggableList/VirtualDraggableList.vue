<template>
  <div
    class="wrapper"
    ref="wrapper"
    @scroll="onScroll"
  >
    <div
      :class="{ 'skeleton-loader': isScrolling }"
      :style="{ height: `${totalItemsHeight}px`, overflow: 'hidden' }"
    >
      <draggable
        :key="draggableKey"
        animation="200"
        ghost-class="draggable-ghost"
        :style="{ transform: `translateY(${offsetY}px)` }"
        :disabled="disabled"
        @end="onDragEnd"
      >
        <div
          v-for="item in visibleItems"
          :data-id="item[keyField]"
          ref="items"
          :key="item[keyField]"
        >
          <slot :item="item" />
        </div>
        <resize-observer @notify="onItemResize" />
      </draggable>
    </div>

    <resize-observer @notify="updateViewportHeight" />
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { ResizeObserver } from 'vue-resize'
import Draggable, { EndEvent } from 'vuedraggable'

const findStartNode = (scrollTop: number, nodePositions: number[], itemCount: number): number => {
  if (itemCount === 0) { return 0 }

  let startRange = 0
  let endRange = itemCount - 1
  while (endRange !== startRange) {
    const middle = Math.floor((endRange - startRange) / 2 + startRange)

    if (
      nodePositions[middle] <= scrollTop &&
      nodePositions[middle + 1] > scrollTop
    ) {
      return middle
    }

    if (middle === startRange) {
      return endRange
    } else {
      if (nodePositions[middle] <= scrollTop) {
        startRange = middle
      } else {
        endRange = middle
      }
    }
  }
  return itemCount
}

const findEndNode = (
  nodePositions: number[],
  startNode: number,
  itemCount: number,
  height: number
): number => {
  let endNode
  for (endNode = startNode; endNode < itemCount; endNode++) {
    if (nodePositions[endNode] > nodePositions[startNode] + height) {
      return endNode
    }
  }
  return endNode
}

/**
 * Renders a draggable virtual list of items.
 *
 * Works exactly in the same way as <draggable> component.
 * To increase performance it introduces virtual scroll support.
 *
 * Provides a slot, to render each given item. The item value is given to the "default" slot.
 *
 * "scrollTo(index: number)" can be used to position item with provided index in the viewport.
 *
 * Emits "change(oldItem, newItem)" on items sort
 */
@Component({
  name: 'virtual-draggable-list',
  components: {
    Draggable,
    ResizeObserver
  }
})
export default class VirtualDraggableList extends Vue {
  /**
   * List of items to render.
   *
   * Each item must include a key ("id" by default) field.
   */
  @Prop({ required: true, type: Array as () => Record<string, unknown>[] })
  items!: Record<string, unknown>[]

  /**
   * Keyed field name.
   *
   * "id" by default.
   */
  @Prop({ default: 'id', type: String })
  keyField!: string

  /**
   * Minimal item height.
   *
   * Used to support dynamic items height, to initialize wrapper height.
   *
   * Default value 30px
   */
  @Prop({ type: Number, default: 30 })
  minItemHeight!: number

  /**
   * Used as a buffer to render items before and after visible
   * items outside the viewport.
   *
   * 50 items by default.
   */
  @Prop({ type: Number, default: 50 })
  preRenderItems!: number

  /**
   * Disables drag action.
   */
  @Prop({ type: Boolean })
  disabled!: boolean

  /**
   * Draggable component key to re-render draggable component on update.
   * Items rendered inside draggable are not static because of the virtual scroll.
   */
  draggableKey: string = uuidv4()

  /**
   * Keeps current viewport height.
   */
  viewportHeight: number = 0
  /**
   * Keeps current scrollTop value.
   */
  scrollTop: number = 0

  /**
   * Keeps scrolling state.
   * To render skeleton animation only for scrolling state.
   */
  isScrolling: boolean = false

  /**
   * Keeps the items positions.
   * By calculating clientHeight or minItemHeight.
   * To support dynamic item height.
   */
  itemsPositions: number[] = [0]

  $refs!: Vue['$refs'] & {
    wrapper: HTMLElement,
    items: HTMLElement[]
  }

  mounted (): void {
    this.onItemResize()
  }

  @Watch('items')
  onItemChange (items: Record<string, unknown>[]): void {
    for (let i = 1; i < items.length; i++) {
      this.$set(this.itemsPositions, i, this.itemsPositions[i - 1] + this.getItemHeight(i - 1))
    }

    this.updateViewportHeight()
  }

  /**
   * Returns first visible item Y position
   * to position items list inside the viewport
   * using CSS transform: translateY().
   */
  get offsetY (): number {
    return this.itemsPositions[this.firstVisibleIndex]
  }

  get firstNode (): number {
    return findStartNode(this.scrollTop, this.itemsPositions, this.items.length)
  }

  get firstVisibleIndex (): number {
    return Math.max(0, this.firstNode - this.preRenderItems)
  }

  get lastVisibleIndex (): number {
    const lastVisibleNode = findEndNode(
      this.itemsPositions,
      this.firstNode,
      this.items.length,
      this.viewportHeight
    )
    return Math.min(this.items.length - 1, lastVisibleNode + this.preRenderItems)
  }

  get itemsCount (): number {
    return this.lastVisibleIndex - this.firstVisibleIndex + 1
  }

  get visibleItems (): Record<string, unknown>[] {
    return this.items.slice(this.firstVisibleIndex, this.firstVisibleIndex + this.itemsCount)
  }

  get totalItemsHeight (): number {
    return this.itemsPositions[this.items.length - 1] + this.getItemHeight(this.items.length - 1)
  }

  /**
   * Sets scrollTop to place item with provided index inside the viewport.
   */
  scrollTo (index: number): void {
    this.$refs.wrapper.scrollTop = this.itemsPositions[index]
  }

  onScroll (): void {
    this.scrollTop = this.$refs.wrapper.scrollTop

    this.isScrolling = true
    this.$nextTick(() => {
      debounce(() => {
        this.isScrolling = false
      }, 500)()
    })
  }

  /**
   * Recalculates clientHeight for all items on resize.
   */
  onItemResize (): void {
    for (let i = this.firstVisibleIndex; i < this.items.length; i++) {
      // we set the position of the next item, based on height of previous items + current item
      this.$set(this.itemsPositions, i + 1, this.itemsPositions[i] + this.getItemHeight(i))
    }
  }

  /**
   * Update viewport height on resize or items list update.
   */
  updateViewportHeight (): void {
    this.viewportHeight = this.$refs.wrapper?.clientHeight || 0

    if (!this.viewportHeight) {
      setTimeout(() => {
        this.updateViewportHeight()
      }, 100)
    }
  }

  getItemHeight (index: number): number {
    const visibleIndex = index - this.firstVisibleIndex
    return this.$refs.items?.[visibleIndex]?.clientHeight || this.minItemHeight
  }

  onDragEnd (event: EndEvent<HTMLLIElement>): void {
    const itemId = event.item?.dataset?.id
    const item = this.items.find(item => item[this.keyField] === itemId)

    this.$emit('change', {
      oldItem: item,
      newItem: this.visibleItems[event.newIndex]
    })

    /**
     * Re-render draggable component
     * without this it keeps moved item
     * (when it's in combination with scroll)
     */
    this.draggableKey = uuidv4()
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  overflow-y: auto;
}

// eslint-disable vue-scoped-css/no-unused-selector
.draggable-ghost {
  opacity: .1;
}

.skeleton-loader {
  position: relative;
  z-index: 1;

  &::after {
    content: '';

    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: -1;
    display: block;
    width: 100%;
    height: 100%;

    background-image: url('/static/imgs/layerbar-item-preview.svg');
    background-size: 100% 30px;
  }
}
</style>
