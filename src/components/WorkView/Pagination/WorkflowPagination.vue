<template>
  <div>
    <chevron-pagination
      class="pagination"
      prev="Previous task <span class='tooltip__hotkey'><</span>"
      next="Next task <span class='tooltip__hotkey'>></span>"
      :page="page || 0"
      :page-count="totalItems"
      dynamic-width
      @prev="selectPreviousPage"
      @next="selectNextPage"
      @prev-secondary="selectPreviousPageIfNotVideo"
      @next-secondary="selectNextPageIfNotVideo"
      @page="selectPage"
    />
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce'
import { Component, Prop, Vue } from 'vue-property-decorator'
import { State } from 'vuex-class'

import { ChevronPagination } from '@/components/WorkView/Pagination'
import { Editor } from '@/engine/editor'
import { DatasetItemPayload, RootState } from '@/store/types'

/**
 * Wraps base ChevronPagination comonent into navigation logic for the workflow
 * */
@Component({
  name: 'workflow-pagination',
  components: { ChevronPagination }
})
export default class WorkflowPagination extends Vue {
  @Prop({ required: true })
  editor!: Editor

  @State(state => state.workview.selectedDatasetItem)
  selectedDatasetItem!: DatasetItemPayload

  @State(state => state.workview.datasetItems)
  datasetItems!: DatasetItemPayload[]

  @State(
    (state: RootState) => state.workview.datasetItemCounts
      ? state.workview.datasetItemCounts.item_count
      : 0
  )
  totalItems!: number

  /**
   * Determines which page the nested <chevron-pagination> is on
   *
   * Returns the 1-based index of the selected work item
   */
  get page (): number | null {
    const { selectedDatasetItem, datasetItems } = this
    if (!selectedDatasetItem) { return null }
    const index = datasetItems.findIndex(w => w.id === selectedDatasetItem.id)
    return index > -1 ? index + 1 : null
  }

  /** Handles user typing a value into `<chevron-pagination>` */
  selectPage (page: number): void {
    this.selectIndexDebounced(this, page - 1)
  }

  /**
   * Handles user clicking the prev chevron in `<chevron-pagination>`, or
   * pushing the `<` key.
   */
  selectNextPage (): void {
    if (this.page === null) { return }
    // page is 1-based, index is 0-based
    this.selectIndexDebounced(this, this.page)
  }

  /**
   * Handles user clicking the next chevron in `<chevron-pagination>`, or
   * pushing the `>` key.
   */
  selectPreviousPage (): void {
    if (this.page === null) { return }
    // page is 1-based, index is 0-based
    this.selectIndexDebounced(this, this.page - 2)
  }

  /**
   * Handles `.` hotkey in chevron pagination
   *
   * Since that one is also used by video playback, we need to ignore it
   */
  selectNextPageIfNotVideo (): void {
    if (this.editor.loadedVideo) { return }
    this.selectNextPage()
  }

  /**
   * Handles `,` hotkey in chevron pagination
   *
   * Since that one is also used by video playback, we need to ignore it
   */
  selectPreviousPageIfNotVideo (): void {
    if (this.editor.loadedVideo) { return }
    this.selectPreviousPage()
  }

  /**
   * Emits `select-seq` event with the current page as the parameter
   *
   * `SeqPagination` is used in all the different workviews, each of which has a
   * different navigation structure.
   *
   * Due to this, we cannot navigate from here directly, but rather emit the
   * event, so the parent component can handle it.
   */
  selectIndex (vm: WorkflowPagination, index: number): void {
    const { name, params, query } = vm.$route
    const item = this.datasetItems[index]
    if (!item) { return }
    const image = item.seq.toString()
    vm.$router.replace({ name: name || undefined, params, query: { ...query, image } })
    vm.$ga.event('dataset_image_view', 'set_selected_image_index')
  }

  /**
   * Trigger work item selection by index on a trailing debounce.
   *
   * The debounce is trailing because we want a delay as the user is typing in a
   * number into the pagination input, as well as a delay when the user is
   * "spam-clicking" the next or prev chevrons.
   * */
  selectIndexDebounced = debounce(this.selectIndex, 100, { leading: false, trailing: true })
}
</script>
