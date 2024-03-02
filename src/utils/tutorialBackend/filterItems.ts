import { DatasetItemPayload, DatasetItemStatus } from '@/store/types'
import { LoadDatasetItemsParams } from '@/utils/backend/loadDatasetItems'

const matchesAssigness = (item: DatasetItemPayload, assignees: number[]): boolean => {
  if (!item.current_workflow) { return false }
  return Object.values(item.current_workflow.stages)
    .flat()
    .some(s => s.assignee_id && assignees.includes(s.assignee_id))
}

const matchesIds = (item: DatasetItemPayload, ids: number[]): boolean => ids.includes(item.id)

const matchesStatuses = (item: DatasetItemPayload, statuses: DatasetItemStatus[]): boolean =>
  statuses.includes(item.status)

/**
 * Filters items by one of the supported filter params.
 * NOTE: Filtering by item type (video, frame, image) is currently not supported
 */
export const filterItems = (
  items: DatasetItemPayload[],
  params: Omit<LoadDatasetItemsParams, 'page' | 'datasetId'>
): DatasetItemPayload[] =>
  items.filter(i => {
    return (
      (!params.assignees || matchesAssigness(i, params.assignees)) &&
        (!params.ids || matchesIds(i, params.ids)) &&
        (!params.statuses || matchesStatuses(i, params.statuses))
    )
  })

export default filterItems
