<template>
  <div>
    <chevron-pagination
      class="pagination"
      prev="Previous task <span class='tooltip__hotkey'><</span>"
      next="Next task <span class='tooltip__hotkey'>></span>"
      :page="page || 0"
      :page-count="totalItems"
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
import { computed, defineComponent } from 'vue'

import { ChevronPagination } from '@/components/WorkView/Pagination'
import { useGA, useStore } from '@/composables'
import { useActiveView, useEditorV2 } from '@/composables/useEditorV2'
import { useRouter } from '@/composables/useRouter'

/**
 * Wraps base ChevronPagination comonent into navigation logic for the workflow
 * */
export default defineComponent({
  name: 'WorkflowPagination',
  components: { ChevronPagination },
  setup () {
    const { state } = useStore()
    const { resolveEditor } = useEditorV2()
    const editor = resolveEditor()
    if (!editor) { throw new Error('Editor was not injected into the app') }
    const router = useRouter()
    const ga = useGA()
    const activeview = useActiveView()
    const page = computed(() => {
      const selectedItemId = state.workview.selectedDatasetItemV2Id
      if (!selectedItemId) { return null }
      const index = state.dataset.datasetItemIdsV2.indexOf(selectedItemId)
      return index > -1 ? index + 1 : null
    })
    const totalItems = computed(() => {
      return state.dataset.datasetItemIdsV2.length
    })

    const selectIndex = (index: number): void => {
      const { name, params, query } = router.currentRoute
      const id = state.dataset.datasetItemIdsV2[index]
      if (!id) { return }
      router.replace({
        name: name || undefined,
        params,
        query: {
          ...query,
          item: id
        }
      })
      ga.event('dataset_image_view', 'set_selected_image_index')
    }

    const selectIndexDebounced = debounce(selectIndex, 100, { leading: false, trailing: true })

    const selectPage = (page: number): void => {
      // page is 1-based, index is 0-based
      selectIndexDebounced(page - 1)
    }

    const selectPreviousPage = (): void => {
      if (page.value === null) { return }
      // page is 1-based, index is 0-based
      selectIndexDebounced(page.value - 2)
    }

    const selectNextPage = (): void => {
      if (page.value === null) { return }
      // page is 1-based, index is 0-based
      selectIndexDebounced(page.value)
    }

    const selectPreviousPageIfNotVideo = (): void => {
      if (activeview.value.fileManager.isProcessedAsVideo) { return }
      selectPreviousPage()
    }

    const selectNextPageIfNotVideo = (): void => {
      if (activeview.value.fileManager.isProcessedAsVideo) { return }
      selectNextPage()
    }

    return {
      page,
      totalItems,
      selectPage,
      selectPreviousPage,
      selectNextPage,
      selectPreviousPageIfNotVideo,
      selectNextPageIfNotVideo
    }
  }
})
</script>
