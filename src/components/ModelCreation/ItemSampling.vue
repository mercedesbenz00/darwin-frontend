<template>
  <div class="sampling">
    <template v-if="loading || sampleItems.length > 0">
      <h4 class="sampling__header">
        Item Samples
      </h4>
      <div class="sampling__content">
        <button
          :disabled="scrollerStart === 0"
          class="sampling__navigation sampling__navigation--prev"
          @click="prev"
        >
          ◀
        </button>
        <div
          ref="imageCarousel"
          class="sampling__container"
        >
          <recycle-scroller
            ref="recycleScroller"
            v-dragscroll.x
            :buffer="buffer"
            :emit-update="true"
            :item-size="itemSize"
            :items="sampleItems"
            class="sampling__container__scroller"
            direction="horizontal"
            key-field="id"
            @update="setScrollerBounds"
          >
            <template #default="{ item }">
              <div class="sampling__card-container">
                <item-sample
                  v-if="dataset.version === 1"
                  :data="item"
                />
                <item-sample-v2
                  v-if="dataset.version === 2"
                  :data="item"
                />
              </div>
            </template>
          </recycle-scroller>
        </div>
        <button
          v-tooltip="nextPageIsLast ? 'Load more' : undefined"
          class="sampling__navigation sampling__navigation--next"
          :disabled="loading"
          @click="next"
        >
          ▶
        </button>
      </div>
    </template>
    <div
      v-else
      class="sampling__placeholder"
    >
      This dataset contains no completed items
    </div>
  </div>
</template>

<script lang="ts">
import { dragscroll } from 'vue-dragscroll'
import { Component, Vue, Watch } from 'vue-property-decorator'
import { RecycleScroller } from 'vue-virtual-scroller'
import { State } from 'vuex-class'

import {
  DatasetItemPayload,
  DatasetPayload,
  RootState,
  V2DatasetItemPayload
} from '@/store/types'

import ItemSample from './ItemSample.vue'
import ItemSampleV2 from './ItemSampleV2.vue'

@Component({
  name: 'item-sampling',
  components: { ItemSample, ItemSampleV2, RecycleScroller },
  directives: { dragscroll }
})
export default class ItemSampling extends Vue {
  @State((state: RootState) => state.neuralModel.newModelDataset)
  dataset!: DatasetPayload | null

  @Watch('dataset', { immediate: true })
  onDataset (): void { this.loadSamples() }

  loading: boolean = false

  async loadSamples (): Promise<void> {
    const { dataset } = this
    if (!dataset) { return }
    this.loading = true
    await this.$store.dispatch('neuralModel/loadSampleDatasetItems')
    this.loading = false
  }

  @State((state: RootState) => state.neuralModel.newModelSampleItems)
  items!: DatasetItemPayload[]

  @State((state: RootState) => state.neuralModel.newModelSampleItemsV2)
  itemsV2!: V2DatasetItemPayload[]

  get sampleItems (): DatasetItemPayload[] | V2DatasetItemPayload[] {
    const { dataset } = this
    if (!dataset) { return [] }
    return dataset.version === 2 ? this.itemsV2 : this.items
  }

  /**
   * Index of left-most item in scroller
   *
   * If 0, "prev" button will be disabled
   */
  scrollerStart: number = 0;
  scrollerEnd: number = 0;

  setScrollerBounds (): void {
    const { $refs, itemSize } = this
    if (!$refs) { return }
    const { recycleScroller } = $refs
    if (!recycleScroller) { return }

    const scroll = recycleScroller.getScroll()
    this.scrollerStart = Math.floor(scroll.start / itemSize)
    this.scrollerEnd = Math.floor(scroll.end / itemSize)
  }

  get nextPageIsLast (): boolean {
    const { scrollerStart, scrollerEnd, items } = this

    const pageSize = scrollerEnd - scrollerStart + 1

    return (items.length - scrollerEnd) <= pageSize
  }

  get itemSize (): number {
    return 160 * this.$theme.getCurrentScale()
  }

  // scroller behavior

  buffer = 2000

  $refs!: Vue['$refs'] & {
    recycleScroller: InstanceType<typeof RecycleScroller>
  }

  // navigation

  async next (): Promise<void> {
    const { scrollerEnd, nextPageIsLast } = this

    if (nextPageIsLast) {
      await this.loadSamples()
    }

    const { $refs } = this
    if (!$refs) { return }
    const { recycleScroller } = $refs
    if (!recycleScroller) { return }

    recycleScroller.scrollToItem(scrollerEnd - 1)
  }

  prev (): void {
    const { $refs, itemSize } = this
    if (!$refs) { return }
    const { recycleScroller } = $refs
    if (!recycleScroller) { return }

    const scroll = recycleScroller.getScroll()
    const offset = scroll.end - scroll.start - itemSize
    const target = scroll.start - offset
    const index = Math.floor(target / itemSize)

    recycleScroller.scrollToItem(index)
  }
}
</script>

<style lang="scss" scoped>
.sampling__header {
  @include typography(lg-1, Mulish, bold);
}
.sampling__content {
  width: 100%;
  height: 150px;

  display: grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  justify-content: start;
  column-gap: 8px;
}

.sampling__navigation {
  margin-top: -50px;

  height: 34px;
  width: 34px;
  border-radius: 50%;
  font-family: "system";
  background-color: transparent;
  color: $colorAliceNight;

  transition: background-color .2s ease;

  &:hover:not(:disabled) {
    background-color: $colorAliceShade;
  }

  &:disabled {
    color: $colorAliceShadow;
  }
}

.sampling__container {
  height: 100%;
  width: 100%;

  // prevents grid blowout
  min-width: 1px;
}

.sampling__container__scroller {
  height: 100%;
  width: 100%;

  @include hidden-scrollbar;

  // switch cursor to grabbing on drag (used with vue-dragscroll)
  &:active { cursor: grabbing; }
}

.sampling__card-container {
  width: 150px;
  height: 150px;
}

.sampling__placeholder {
  grid-row: 1 / 3;
  justify-self: center;
}
</style>
