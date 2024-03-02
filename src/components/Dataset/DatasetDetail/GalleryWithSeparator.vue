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
      <dynamic-scroller
        v-if="viewMode === VIEW_MODE.CARD"
        ref="dynamicScroller"
        class="gallery__content__scroll-container gallery__content__scroll-container--card"
        key-field="id"
        min-item-size="25"
        :items="cardRows"
        emit-update
        @update="onScroll"
      >
        <template #before>
          <div
            v-if="loaded && isEmpty"
            class="gallery__content__no-data"
          >
            {{ emptyMessage }}
          </div>
        </template>

        <template #default="{ item: row, active, index: rowIndex }">
          <dynamic-scroller-item
            v-if="row.data === 'separator'"
            :item="row"
            :active="true"
            :data-index="rowIndex"
          >
            <!-- Reserve space for real separator -->
            <div class="separator">
              <slot name="separator" />
            </div>
          </dynamic-scroller-item>

          <dynamic-scroller-item
            v-else-if="row.data && row.data.length > 0"
            class="gallery__content__scroll-container__row"
            :item="row"
            :size-dependencies="[row.data]"
            :active="active"
            :data-index="rowIndex"
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
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
      <template v-if="viewMode === VIEW_MODE.LIST">
        <div
          v-if="loaded && !allItems.length"
          class="gallery__content__no-data"
        >
          {{ emptyMessage }}
        </div>
        <recycle-scroller
          v-else
          ref="dynamicScroller"
          class="gallery__content__scroll-container gallery__content__scroll-container--list"
          key-field="id"
          :buffer="2500"
          :item-size="listItemHeight"
          :items="allItems"
        >
          <template #default="{ item, index }">
            <slot
              name="list-item"
              :item="item"
              :index="index"
            />
          </template>
        </recycle-scroller>
      </template>
    </div>
    <div
      ref="separator"
      class="separator_hidden"
    >
      <slot name="separator" />
    </div>
    <resize-observer @notify="onResize" />
  </div>
</template>

<script lang="ts">
import { chunk } from 'lodash'
import { Component, Prop, Watch, Mixins } from 'vue-property-decorator'
import { ResizeObserver } from 'vue-resize'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-resize/dist/vue-resize.css'

import Gallery, { CardRow } from '@/components/Common/Gallery/Gallery.vue'
import { GalleryItem, VIEW_MODE, GalleryProps } from '@/components/Common/Gallery/types'

type SeparatorRow = {
  id: string,
  data: 'separator'
}

type GalleryWithSeparatorProps = Omit<GalleryProps, 'items'> & {
  items: GalleryItem[][]
}

/**
 * Inherit Gallery implementation to reduce copy/paste
 * @ts-ignore prevent lint error for properties that override Gallery property
 */
@Component({
  name: 'gallery-with-separator',
  components: { ResizeObserver }
})
export default class GalleryWithSeparator
  extends Mixins(Gallery)
  implements GalleryWithSeparatorProps {

  @Prop({ required: true })
  // @ts-ignore
  items!: GalleryItem[][]

  // @ts-ignore
  $refs!: Vue['$refs'] & {
    dynamicScroller: InstanceType<typeof RecycleScroller>
    separator: HTMLElement
  }

  separatorElement: HTMLElement | null = null
  separatorExpanderId: string = 'separator_expander'
  separatorWrapperId: string = 'separator_wrapper'

  get isEmpty () {
    return !this.items[0]?.length
  }

  get allItems () {
    return this.items.flat()
  }

  navigateToInitialItem () {
    if (!this.$refs.dynamicScroller) { return }
    if (!this.initialItemId) { return }

    const index = this.allItems.findIndex(item => item.id === this.initialItemId)
    if (index < 0) { return }

    this.$refs.dynamicScroller.scrollToItem(index)
  }

  @Watch('fixedColumnCount')
  onFixedColumnCountChange () {
    this.updateContainerWidth()
    this.updateSeparatorHeight()
  }

  @Watch('cardRows')
  onCardRowsChange () {
    this.updateContainerWidth()
    this.updateSeparatorHeight()
  }

  // @ts-ignore
  get cardRows (): Array<CardRow | SeparatorRow> {
    if (this.viewMode === VIEW_MODE.LIST) { return [] }

    const rows: Array<CardRow | SeparatorRow> = []

    this.items.forEach((item: GalleryItem[], index: number) => {
      const itemRows: CardRow[] = chunk(item, this.columnCount).map((rowData) => ({
        data: rowData,
        id: `row-${rowData.map((i) => i.id).join('-')}`,
        padding: []
      }))

      const lastRow: CardRow | SeparatorRow = (rows[rows.length - 1])
      if (lastRow && lastRow.data !== 'separator') {
        const paddingCount = this.columnCount - lastRow.data.length
        lastRow.padding = []
        for (let i = 0; i < paddingCount; i++) {
          lastRow.padding.push({ id: i + lastRow.data.length })
        }
      }

      rows.push(...itemRows)

      if (index !== this.items.length - 1) {
        rows.push({
          id: `separator_${index}`,
          data: 'separator'
        })
      }
    })

    return rows
  }

  get separatorIndex (): number {
    return Math.ceil(this.items[0].length / this.columnCount)
  }

  mounted () {
    this.cardWidth = this.preferredCardWidth
    this.updateContainerWidth()
    this.setSeparator()
    setTimeout(this.navigateToInitialItem, 500)

    this.separatorElement = this.$refs.separator.children[0] as HTMLElement
  }

  onScroll (): void {
    this.updateSeparatorHeight()
  }

  updateSeparatorHeight (): void {
    const scroller = this.$refs.dynamicScroller?.$refs?.scroller as Vue

    if (!scroller) { return }

    const getScrollerMarginTop = (): number => {
      if (scroller.$refs?.wrapper) {
        const compStyle = window.getComputedStyle(scroller.$refs.wrapper as HTMLElement)
        return parseFloat(compStyle.marginTop)
      }

      return 0
    }
    const itemHeight = this.cardHeight + this.cardMarginTB * 2
    const totalItemsHeightTillSeparator = itemHeight * this.separatorIndex

    const existingExpander = document.getElementById(this.separatorExpanderId)
    if (existingExpander) {
      existingExpander.style.height = `${totalItemsHeightTillSeparator + getScrollerMarginTop()}px`
    }
  }

  setSeparator (): void {
    const scroller = this.$refs.dynamicScroller?.$refs?.scroller as Vue
    if (!scroller || !this.separatorElement) {
      // if the scroller is undefined which means still being mounted
      // we need to calculate the container width again.
      setTimeout(() => this.setSeparator(), 200)
      return
    }

    this.separatorElement.style.pointerEvents = 'all'
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 1) {
          this.$emit('scroll-above-separator')
        }
      },
      { threshold: [1] }
    )
    observer.observe(this.separatorElement)

    const wrapper = document.createElement('div')
    wrapper.id = this.separatorWrapperId
    wrapper.style.position = 'absolute'
    wrapper.style.top = '0'
    wrapper.style.width = '100%'
    wrapper.style.zIndex = '1'
    wrapper.style.pointerEvents = 'none'

    const expander = document.createElement('div')
    expander.id = this.separatorExpanderId
    expander.style.pointerEvents = 'none'
    expander.style.width = '0'
    expander.style.zIndex = '-1'

    wrapper.appendChild(expander)
    wrapper.appendChild(this.separatorElement)
    /**
     * Create common parent for scroller and separator
     * to position separator properly
     */
    const commonWrapper = document.createElement('div')
    commonWrapper.style.position = 'relative'
    commonWrapper.appendChild(wrapper)
    commonWrapper.appendChild(scroller.$refs.wrapper as HTMLElement)

    scroller.$el.appendChild(commonWrapper)

    this.updateSeparatorHeight()
  }

  updateContainerWidth (): void {
    const scroller = this.$refs.dynamicScroller?.$refs?.scroller as Vue
    const wrapper = scroller?.$refs?.wrapper as HTMLElement
    if (!scroller || !wrapper) {
      // if the scroller is undefined which means still being mounted
      // we need to calculate the container width again.
      setTimeout(() => this.updateContainerWidth(), 200)
      return
    }

    this.containerWidth = wrapper.clientWidth

    if (this.fixedColumnCount > 0) {
      this.cardWidth = this.containerWidth / this.fixedColumnCount - this.cardMarginLR * 2
    }
  }

  scrollTo (offsetTop: number): void {
    this.$refs.dynamicScroller?.$refs?.scroller?.scrollToPosition(offsetTop)
  }

  onResize (): void {
    this.updateContainerWidth()
    this.updateSeparatorHeight()
  }

  public scrollToSeparator (): void {
    this.scrollTo(this.cardHeight * this.separatorIndex)
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
}

.gallery__content__scroll-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.gallery__content--card-mode {
  width: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: flex-start;
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
  vertical-align: middle;
}
</style>

<!-- eslint-disable vue-scoped-css/enforce-style-type -->
<style lang="scss">
.gallery__content__scroll-container {
  .vue-recycle-scroller__item-wrapper {
    width: calc(100% - 80px) !important;
    margin: 5px 40px 20px;
  }
}
</style>

<style lang="scss" scoped>
.separator {
  visibility: hidden;
}
.separator_hidden {
  display: none;
}
</style>
