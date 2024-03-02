import { resolvePageInformation } from '@/components/WorkView/BottomBar/pageRegistry'
import { WorkflowMutation } from '@/store/modules/workview/types'

export const RESOLVE_UNRESOLVED_PAGE_REGISTRY_QUEUE: WorkflowMutation<void> =
  (state) => {
    const {
      datasetItemPageRegistry: pageRegistry,
      datasetItemCursorMappings: cursorMappings
    } = state
    for (let idx = 0; idx < pageRegistry.queue.length; idx++) {
      const page = pageRegistry.queue[idx]
      if (!('datasetItemId' in page)) { return }

      const pages = resolvePageInformation(cursorMappings, page.datasetItemId)
      if (pages.length === 0 || 'datasetItemId' in pages[0]) { return }

      pageRegistry.queue.splice(idx, 1, pages[0])
      if (pages.length > 1) { pageRegistry.queue.push(pages[1]) }
    }
  }
