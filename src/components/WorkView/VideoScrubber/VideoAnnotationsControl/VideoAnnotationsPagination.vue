<template>
  <div>
    <chevron-pagination
      class="video-annotations-pagination"
      :prev="'Previous frame <span class=\'tooltip__hotkey\'>,</span>'"
      :next="'Next frame <span class=\'tooltip__hotkey\'>.</span>'"
      arrow
      :page="currentFrameIndex"
      :page-count="totalFrames"
      @prev="selectPreviousFrame"
      @next="selectNextFrame"
      @prev-secondary="selectPreviousFrame"
      @next-secondary="selectNextFrame"
      @page="selectFrame"
    />
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { Component, Prop, Vue } from 'vue-property-decorator'

import { ChevronPagination } from '@/components/WorkView/Pagination'
import { Editor } from '@/engine/editor'

/**
 * Wraps base ChevronPagination comonent into navigation logic for the workflow
 * */
@Component({
  name: 'video-annotations-pagination',
  components: { ChevronPagination }
})
export default class VideoAnnotationsPagination extends Vue {
  @Prop({ required: true })
  editor!: Editor

  /**
   * Determines which page the nested <chevron-pagination> is on
   *
   * Returns the 1-based index of the selected work item
   */
  get currentFrameIndex (): number {
    return this.editor.activeView.zeroBasedCurrentFrameIndex + 1
  }

  get totalFrames (): number {
    return this.editor.activeView.totalFrames
  }

  /** Handles user typing a value into `<chevron-pagination>` */
  selectFrame (frameIndex: number): void {
    this.selectFrameDebounced(frameIndex - 1)
  }

  /** Handles user clicking the prev chevron in `<chevron-pagination>` */
  selectNextFrame (): void {
    if (this.currentFrameIndex === null) { return }
    // frameIndex is 1-based, index is 0-based
    this.selectFrameDebounced(this.currentFrameIndex)
  }

  /** Handles user clicking the next chevron in `<chevron-pagination>` */
  selectPreviousFrame (): void {
    if (this.currentFrameIndex === null) { return }
    // frameIndex is 1-based, index is 0-based
    this.selectFrameDebounced(this.currentFrameIndex - 2)
  }

  selectFrameIndex (frameIndex: number): void {
    const { editor } = this
    editor.jumpToFrame(frameIndex)
  }

  /**
   * Trigger frame selection by index on a trailing debounce.
   *
   * The debounce is trailing because we want a delay as the user is typing in a
   * number into the pagination input, as well as a delay when the user is
   * "spam-clicking" the next or prev chevrons.
   * */
  selectFrameDebounced = debounce(this.selectFrameIndex, 10, { leading: false, trailing: true })
}
</script>

<style lang="scss" scoped>
:deep(.video-annotations-pagination) {
  width: auto;

  .pagination-button,
  .pagination__input-container {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
