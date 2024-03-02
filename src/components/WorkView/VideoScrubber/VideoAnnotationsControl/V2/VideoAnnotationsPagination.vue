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
import { ref, defineComponent, watch, onBeforeUnmount } from 'vue'

import { ChevronPagination } from '@/components/WorkView/Pagination'
import { useActiveView } from '@/composables/useEditorV2'

/**
 * Wraps base ChevronPagination comonent into navigation logic for the workflow
 * */
export default defineComponent({
  name: 'VideoAnnotationsPagination',
  components: { ChevronPagination },
  setup () {
    const activeView = useActiveView()
    /**
     * Determines which page the nested <chevron-pagination> is on
     *
     * Returns the 1-based index of the selected work item
     */
    const currentFrameIndex = ref(0)
    const totalFrames = ref(0)

    const selectFrameIndex = (frameIndex: number): void => {
      activeView.value.editor.jumpToFrame(frameIndex)
    }

    /**
     * Trigger frame selection by index on a trailing debounce.
     *
     * The debounce is trailing because we want a delay as the user is typing in a
     * number into the pagination input, as well as a delay when the user is
     * "spam-clicking" the next or prev chevrons.
     * */
    const selectFrameDebounced = debounce(selectFrameIndex, 10, { leading: false, trailing: true })

    /** Handles user typing a value into `<chevron-pagination>` */
    const selectFrame = (frameIndex: number): void => {
      selectFrameDebounced(frameIndex - 1)
    }

    /** Handles user clicking the prev chevron in `<chevron-pagination>` */
    const selectNextFrame = (): void => {
      if (currentFrameIndex.value === null) { return }
      // frameIndex is 1-based, index is 0-based
      selectFrameDebounced(currentFrameIndex.value)
    }

    /** Handles user clicking the next chevron in `<chevron-pagination>` */
    const selectPreviousFrame = (): void => {
      if (currentFrameIndex.value === null) { return }
      // frameIndex is 1-based, index is 0-based
      selectFrameDebounced(currentFrameIndex.value - 2)
    }

    const handleCurrentFrameIndexChanged = (index: number): void => {
      currentFrameIndex.value = index + 1
    }

    watch(activeView, (newView, oldView) => {
      oldView?.off('currentFrameIndex:changed', handleCurrentFrameIndexChanged)

      totalFrames.value = newView.totalFrames

      handleCurrentFrameIndexChanged(newView.currentFrameIndex)
      newView.on('currentFrameIndex:changed', handleCurrentFrameIndexChanged)
    }, { immediate: true })

    onBeforeUnmount(() => {
      activeView.value.off('currentFrameIndex:changed', handleCurrentFrameIndexChanged)
    })

    return {
      currentFrameIndex,
      totalFrames,
      selectFrame,
      selectNextFrame,
      selectPreviousFrame
    }
  }
})
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
