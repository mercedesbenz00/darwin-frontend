import { isEqual } from 'lodash'

import { DatasetItemCursorMapping } from '@/store/modules/workview/types'

export const DEFAULT_ITEMS_PAGE_SIZE = 50

export type Page =
  { from?: string, size: number } |
  { to?: string, size: number } |
  { datasetItemId: number | string }

export type PageRegistry = {
  queue: Page[],
  requested: Page[]
}

const mergePage = (newPage: Page, pages: Page[]) => {
  const index = pages.findIndex((page) => isEqual(newPage, page))
  if (index < 0) {
    // page was not requested
    pages.push(newPage)
  }
}

// Try to resolve the page information from datasetItemId
// If cursor mapping for that dataset item exists, it does return the new pages to load.
// If not, it will just keep it as is and resolve the page information while
// the pages are being loaded.
export const resolvePageInformation = (
  cursorMappings: DatasetItemCursorMapping[],
  datasetItemId: number | string
): Page[] => {
  const idx = cursorMappings.findIndex((cm) => cm.ids.includes(datasetItemId))
  if (idx < 0) { return [{ datasetItemId }] }

  // We assume that every page always load the previous and next pages.
  // So if the current page is at first or last, then loads the prev/next pages.
  const currentPageMapping = cursorMappings[idx]
  const pages: Page[] = []
  if (currentPageMapping.previous) {
    pages.push({ to: currentPageMapping.previous, size: DEFAULT_ITEMS_PAGE_SIZE })
  }
  if (currentPageMapping.next) {
    pages.push({ from: currentPageMapping.next, size: DEFAULT_ITEMS_PAGE_SIZE })
  }
  return pages
}

export const enqueuePage = (registry: PageRegistry, page: Page) => {
  const { queue, requested } = registry
  const requestedAlready =
    !!(queue.find((rp) => isEqual(rp, page))) ||
    !!(requested.find((rp) => isEqual(rp, page)))
  if (requestedAlready) { return }
  mergePage(page, queue)
}

export const mergeQueue = (registry: PageRegistry): void => {
  const { queue, requested } = registry
  const pendingQueue: Page[] = []
  queue.forEach(page => {
    if ('datasetItemId' in page) { return pendingQueue.push(page) }

    mergePage(page, requested)
  })
  registry.queue = pendingQueue
}
