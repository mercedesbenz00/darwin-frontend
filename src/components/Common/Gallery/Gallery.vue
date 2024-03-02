<template>
  <div
    v-esc="deselectAll"
    class="gallery"
  >
    <div
      v-loading="loading"
      class="gallery__content"
      :class="{
        'gallery__content--card-mode': viewMode === VIEW_MODE.CARD,
        'gallery__content--list-mode': viewMode === VIEW_MODE.LIST
      }"
      :loading-options="{
        label: loadingMessage,
        backgroundColor: $theme.getColor('colorSecondaryLight3')
      }"
    >
      <div
        v-if="viewMode === VIEW_MODE.LIST"
        class="gallery__content__list-item-header"
      >
        <slot name="list-item-header" />
      </div>
      <div
        v-if="loaded && items.length === 0"
        class="gallery__content__no-data"
      >
        {{ emptyMessage }}
      </div>
      <recycle-scroller
        v-else-if="viewMode === VIEW_MODE.CARD"
        ref="recycleScroller"
        class="gallery__content__scroll-container gallery__content__scroll-container--card"
        key-field="id"
        :buffer="2500"
        :item-size="cardHeight + (2 * cardMarginTB)"
        :items="cardRows"
      >
        <template #default="{ item: row, active, index: rowIndex }">
          <div
            v-if="row.data && row.data.length > 0"
            class="gallery__content__scroll-container__row"
          >
            <div
              v-for="(item, index) of row.data"
              :key="`card${item.id}`"
              class="gallery-card"
              :class="{ 'gallery-card--active': active }"
              :style="{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                margin: `${cardMarginTB}px ${cardMarginLR}px`
              }"
            >
              <slot
                name="card"
                :item="item"
                :index="rowIndex * columnCount + index"
              />
            </div>

            <div
              v-for="(padding, index) of row.padding"
              :key="`padding${index}`"
              class="gallery__content__padding-card"
              :style="{
                'width': `${cardWidth}px`,
                'margin': `${cardMarginTB}px ${cardMarginLR}px`
              }"
            />
          </div>
        </template>
      </recycle-scroller>
      <recycle-scroller
        v-else-if="viewMode === VIEW_MODE.LIST"
        ref="recycleScroller"
        class="gallery__content__scroll-container gallery__content__scroll-container--list"
        key-field="id"
        :buffer="2500"
        :item-size="listItemHeight"
        :items="items"
      >
        <template #default="{ item, index }">
          <slot
            name="list-item"
            :item="item"
            :index="index"
          />
        </template>
      </recycle-scroller>
    </div>
    <resize-observer @notify="updateContainerWidth" />
  </div>
</template>

<script lang="ts">
import { chunk } from 'lodash'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { ResizeObserver } from 'vue-resize'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-resize/dist/vue-resize.css'

import { GalleryItem, VIEW_MODE, GalleryProps } from './types'

/**
 * Used to render a data view containing items either listed as cards,
 * or as a plain vertically-scrollable list.
 *
 * The template for each item in card or list view can be set using named slots
 *
 * <gallery
 *  items: myItems
 *  loading: boolean // true if the loading spinner should render
 *  loadingMessage: string // message for the loading spinner
 *  loaded: boolean // true if data is fully loaded
 *  // Preferred card width set by parent, fixedColumnCount and this one is exclusive each other
 *  preferredCardWidth: number
 *  preferredListItemHeight: number // Preferred card height set by parent
 *  emptyMessage: string // message when no data has loaded
 *  selectedAll: boolean // set selection to "select all" checkbox
 *  selectAllEnabled: boolean // renders "select all" checkbox at the top left of the gallery header
 *  viewMode: number // view mode 0: CARD, 1: LIST
 *  fixedColumnCount: number // column count to be sticked as
 *  cardProportion: number // proportion of card's width and height
 *  calculateCardProportion: function // function to calculate the height from card's width
 * />
 *
 * The component supports toggling selection of all items via header checkbox.
 * It does so by emiting a select all event.
 *
 * <template v-slot:card="{ item }">
 *   <my-sloted-card-component
 *     :data="item" // the item containing the data to be rendered
 *   />
 * </template>
 */

export type CardRow = {
  id: string,
  data: GalleryItem[],
  padding: {id: number}[]
}

const DEFAULT_CARD_PROPORTION = 2 / 3

@Component({
  name: 'gallery',
  components: { ResizeObserver }
})
export default class Gallery extends Vue implements GalleryProps {
  containerWidth: number = 0
  cardMarginTB: number = 8
  cardMarginLR: number = 10

  VIEW_MODE = VIEW_MODE

  @Prop({ required: true })
  items!: GalleryItem[]

  @Prop({ required: false, type: Boolean, default: true })
  loaded!: boolean

  @Prop({ required: false, type: Boolean, default: false })
  loading!: boolean

  @Prop({ required: false })
  loadingMessage!: string

  @Prop({ required: false })
  initialItemId?: string

  @Prop({ default: 150, type: Number })
  preferredCardWidth!: number

  @Prop({ default: 40, type: Number })
  preferredListItemHeight!: number

  @Prop({ default: 'No data has been added yet' })
  emptyMessage!: string

  @Prop({ default: true, type: Boolean })
  resizable!: boolean

  @Prop({ default: false, type: Boolean })
  selectedAll!: boolean

  @Prop({ default: false, type: Boolean })
  selectAllEnabled!: boolean

  @Prop({ default: VIEW_MODE.CARD, type: Number })
  viewMode!: number

  @Prop({ default: 0, type: Number })
  fixedColumnCount!: number

  @Prop({ type: Number, required: false })
  cardProportion?: number

  @Prop({ type: Function })
  calculateCardProportion?: Function

  $refs!: Vue['$refs'] & {
    recycleScroller: InstanceType<typeof RecycleScroller>
  }

  @Watch('initialItemId', { immediate: true })
  onInitialItemIdChange () {
    this.navigateToInitialItem()
  }

  navigateToInitialItem () {
    if (!this.$refs.recycleScroller) { return }
    if (!this.initialItemId) { return }

    const index = this.items.findIndex(item => item.id === this.initialItemId)
    if (index < 0) { return }

    this.$refs.recycleScroller.scrollToItem(index)
  }

  /**
   * `RecycleScroller` requires the height of each row to be specified.
   *
   * In card mode, this height depends on the zoom level, so it is computed here.
   */
  cardWidth: number = 150

  get cardHeight () {
    return this.calculateCardProportion
      ? this.calculateCardProportion(this.cardWidth)
      : this.cardWidth * (this.cardProportion || DEFAULT_CARD_PROPORTION)
  }

  get listItemHeight () {
    return this.preferredListItemHeight * this.$theme.getCurrentScale()
  }

  get columnCount () {
    return this.fixedColumnCount ||
      (
        this.containerWidth !== 0
          ? Math.floor(this.containerWidth / (this.cardWidth + 2 * this.cardMarginLR))
          : 4
      )
  }

  @Watch('preferredCardWidth')
  onPreferredCardWidthChange () { this.cardWidth = this.preferredCardWidth }

  @Watch('fixedColumnCount')
  onFixedColumnCountChange () { this.updateContainerWidth() }

  @Watch('cardRows')
  onCardRowsChange () { this.updateContainerWidth() }

  /**
   * Returns the data collection grouped into rows
   *
   * In card view mode, we show items as thumbnails, multiple per row,
   * using `RecycleScroller` from the `vue-virtual-scroll` library.
   *
   * To show multiple items per row, we use this function to group the entire
   * collection into rows.
   *
   * We also support zoom, so rows need to be of varied length. The length of
   * each row is computed as part of this function.
   */
  get cardRows () {
    if (this.viewMode === VIEW_MODE.LIST) { return [] }

    const rows: CardRow[] = chunk(this.items, this.columnCount).map((rowData) => ({
      data: rowData,
      id: `row-${rowData.map((i) => i.id).join('-')}`,
      padding: []
    }))

    const lastRow: CardRow = (rows[rows.length - 1])
    if (lastRow) {
      const paddingCount = this.columnCount - lastRow.data.length
      lastRow.padding = []
      for (let i = 0; i < paddingCount; i++) {
        lastRow.padding.push({ id: i + lastRow.data.length })
      }
    }

    return rows
  }

  mounted () {
    this.cardWidth = this.preferredCardWidth
    this.updateContainerWidth()
    setTimeout(this.navigateToInitialItem, 500)
  }

  /**
   * Called during window resize event.
   *
   * Computes number of columns to render images in, based on container width.
   */
  updateContainerWidth () {
    const scroller = this.$refs.recycleScroller as Vue
    if (!scroller) {
      // if the scroller is undefined which means still being mounted
      // we need to calculate the container width again.
      setTimeout(() => this.updateContainerWidth(), 200)
      return
    }

    this.containerWidth = (scroller.$refs.wrapper as HTMLElement).clientWidth

    if (this.fixedColumnCount > 0) {
      this.cardWidth = this.containerWidth / this.fixedColumnCount - this.cardMarginLR * 2
    }
  }

  setAllSelections (selected: boolean) {
    this.$emit('select-all', selected)
  }

  deselectAll () {
    this.setAllSelections(false)
  }
}
</script>

<style lang="scss" scoped>
.gallery {
  width: 100%;
  height: 100%;
  margin: 0;
  @include col;
}

.gallery__header {
  @include row--center;
  width: 100%;
}

.gallery__header__slot {
  margin: 0 20px 0 0;
}

.gallery__header__line {
  height: 1px;
  flex: 1;
  margin: 0 30px 0 0;
  opacity: 0.5;
  background: $colorSecondaryLight;
}

.gallery__header__zoom {
  @include row--center;
  width: 150px;
  height: 12px;
  margin: 0 0 0 20px;
}

.gallery__content {
  width: 100%;
  height: 100%;
}

.gallery__content__no-data {
  @include row--center;
  @include typography(lg, headlines, bold);
  width: 100%;
  height: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.gallery__content__list-item-header {
  width: 100% !important;
  padding: 0 40px;
  overflow: visible;
}

.gallery__content__scroll-container {
  width: 100%;
  height: 100%;
  min-height: 64px;
  overflow: hidden auto;
}

.gallery__content--card-mode {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: space-between;
  align-content: baseline;
}

.gallery__content--list-mode {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.gallery__content__scroll-container__row {
  display: flex;
  justify-content: flex-start;
}

.gallery__content__padding-card {
  width: 100%;
  height: 100%;
  min-width: 100px;
  min-height: 100px;
  display: inline-block;
  overflow: hidden;
  vertical-align: middle;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.gallery__content__scroll-container {
  .vue-recycle-scroller__item-wrapper {
    width: calc(100% - 80px) !important;
    margin: 5px 40px 20px;
    overflow: visible;
  }
}
</style>
