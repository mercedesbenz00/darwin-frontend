/**
 * Defines functions used in processing messages from the dataset channel
 */

import {
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetItemStatus,
  V2DatasetItemFilter,
  V2DatasetItemPayload
} from '@/store/types'

/**
 * Defines structure of resolved change status for a single item
 */
type ItemChange = {
  /** Old item data. null if item is new */
  from: DatasetItemPayload | null
  /** New item data. null if item is being deleted */
  to: DatasetItemPayload
  /** Index of the item within the existing store items. Null if new item. */
  index: number | null
  /** Change type. */
  type: 'replace' | 'add',
  /** Is the changed (to) item visible based on current store filters */
  visible: boolean
}

type ItemChangeV2 = {
  /** Old item data. null if item is new */
  from: V2DatasetItemPayload | null
  /** New item data. null if item is being deleted */
  to: V2DatasetItemPayload
  /** Index of the item within the existing store items. Null if new item. */
  index: number | null
  /** Change type. */
  type: 'replace' | 'add',
  /** Is the changed (to) item visible based on current store filters */
  visible: boolean
}

const assigneeIds = (item: DatasetItemPayload): number[] =>
  item.current_workflow
    ? Object.values(item.current_workflow.stages)
      .map(stages => stages.map(s => s.assignee_id))
      .flat()
      .filter((id): id is number => id !== null)
    : []

const assigneeIdsV2 = (item: V2DatasetItemPayload): number[] =>
  item.current_workflow
    ? Object.values(item.current_workflow.stages)
      .map(stages => stages.map(s => s.assignee_id))
      .flat()
      .filter((id): id is number => id !== null)
    : []

const getStageTemplateId = (item: DatasetItemPayload): number | null =>
  item.current_workflow
    ? item.current_workflow.current_workflow_stage_template_id
    : null

const getStageIdsV2 = (item: V2DatasetItemPayload): string[] | null =>
  item.workflow_data
    ? item.workflow_data.current_stage_instances.map(i => i.stage_id)
    : null

const resolveStatus = (
  item: DatasetItemPayload,
  statuses?: DatasetItemStatus[]
): boolean => {
  if (!statuses) { return !item.archived }
  if (item.archived) { return statuses.includes(DatasetItemStatus.archived) }
  return statuses.includes(item.status)
}

const resolveStatusV2 = (
  item: V2DatasetItemPayload,
  statuses?: DatasetItemStatus[]
): boolean => {
  if (!statuses) { return !item.archived }
  if (item.archived) { return statuses.includes(DatasetItemStatus.archived) }
  return statuses.includes(item.status)
}

/**
 * For a given item, attempts to resolve if it should be visible based on the
 * given parameters.
 *
 * This is primarily resolved through the filter, where the frontend is able to
 * determine if the item is visible based on status, type, current stage,
 * assignee and currently viewed video.
 *
 * @param {DatasetItemFilter} filter
 * The currently active filter on the management page. Primary way to determine
 * if items are visible.
 *
 * @param {Boolean} folders
 * Indicates if the management page is in folder mode. If that is the case, all
 * items with a different path from the one currently set in filter are not
 * visible.
 */
const resolveVisibility = (
  item: DatasetItemPayload,
  filter: DatasetItemFilter,
  folders: boolean
): boolean => {
  const {
    assignees,
    statuses,
    path,
    types,
    video_ids: videoIds,
    workflow_stage_template_ids: templateIds
  } = filter

  const stageTemplateId = getStageTemplateId(item)

  return (
    resolveStatus(item, statuses) &&
    (!assignees || assigneeIds(item).some(id => assignees.includes(id))) &&
    (!folders || !path || item.path === path) &&
    (!types || types.includes(item.type)) &&
    (!templateIds || (!!stageTemplateId && templateIds.includes(stageTemplateId))) &&
    (!videoIds || (!!item.dataset_video_id && videoIds.includes(item.dataset_video_id)))
  )
}

const resolveVisibilityV2 = (
  item: V2DatasetItemPayload,
  filter: Omit<V2DatasetItemFilter, 'dataset_ids'>,
  folders: boolean
): boolean => {
  const {
    assignees,
    statuses,
    item_path_prefix: itemPathPrefix,
    types,
    workflow_stage_ids: stageIds
  } = filter

  const currentStageIds = getStageIdsV2(item)
  return (
    resolveStatusV2(item, statuses) &&
    (!assignees || assigneeIdsV2(item).some(id => assignees.includes(id))) &&
    (!folders || !itemPathPrefix || item.path === itemPathPrefix) &&
    (!types || (!!item.slot_types && types.some(type => item.slot_types.includes(type)))) &&
    (!stageIds || (!!currentStageIds && currentStageIds.some(id => stageIds.includes(id))))
  )
}

/**
 * Based on current items, current filter and folder view mode, determines how
 * specified updated items should be merged into current items.
 *
 * Returns an object defining how this is done.
 *
 * @param currentItems Items currently in the store
 * @param updatedItems Items that got updated
 * @param filter Currently active item filter
 * @param foldersEnabled Is the management page in folder mode or not?
 */
export const resolveUpdates = (
  currentItems: DatasetItemPayload[],
  updatedItems: DatasetItemPayload[],
  filter: DatasetItemFilter,
  foldersEnabled: boolean
): ItemChange[] => {
  return updatedItems.map(updatedItem => {
    const index = currentItems.findIndex(currentItem => currentItem.id === updatedItem.id)
    const from = index === -1 ? null : currentItems[index]
    const to = updatedItem
    const type = from ? 'replace' : 'add'

    const visible = resolveVisibility(to, filter, foldersEnabled)

    return { from, index: index > -1 ? index : null, to, type, visible }
  })
}

export const resolveUpdatesV2 = (
  currentItems: V2DatasetItemPayload[],
  updatedItems: V2DatasetItemPayload[],
  filter: Omit<V2DatasetItemFilter, 'dataset_ids'>,
  foldersEnabled: boolean
): ItemChangeV2[] => {
  return updatedItems.map(updatedItem => {
    const index = currentItems.findIndex(currentItem => currentItem.id === updatedItem.id)
    const from = index === -1 ? null : currentItems[index]
    const to = updatedItem
    const type = from ? 'replace' : 'add'

    const visible = resolveVisibilityV2(to, filter, foldersEnabled)

    return { from, index: index > -1 ? index : null, to, type, visible }
  })
}

/**
 * Takes existing items and applies changes given by `resolveUpdates`
 *
 * For each change it will either push a new item to the store, replace an
 * existing item in the store, or remove an item from the store.
 */
export const applyItemChanges = (
  changes: ItemChange[],
  existingItems: DatasetItemPayload[]
): DatasetItemPayload[] => {
  const items = [...existingItems]

  changes.forEach(({ to, type, visible }) => {
    if (type === 'add' && to && visible) {
      items.push(to)
    }

    if (type === 'replace' && to && visible) {
      const index = items.findIndex(i => i.id === to.id)
      items.splice(index, 1, to)
      return
    }

    if (type === 'replace' && to && !visible) {
      const index = items.findIndex(i => i.id === to.id)
      items.splice(index, 1)
    }
  })

  return items
}

export const applyItemChangesV2 = (
  changes: ItemChangeV2[],
  existingItems: V2DatasetItemPayload[]
): V2DatasetItemPayload[] => {
  const items = [...existingItems]

  changes.forEach(({ to, type, visible }) => {
    if (type === 'add' && to && visible) {
      items.push(to)
    }

    if (type === 'replace' && to && visible) {
      const index = items.findIndex(i => i.id === to.id)
      items.splice(index, 1, to)
      return
    }

    if (type === 'replace' && to && !visible) {
      const index = items.findIndex(i => i.id === to.id)
      items.splice(index, 1)
    }
  })

  return items
}
/**
 * Payload structure for the `items_updated` message received through the
 * dataset channel
 */
export type ItemsUpdated = {
  // eslint-disable-next-line camelcase
  dataset_items: DatasetItemPayload[]
}

export type ItemsUpdatedV2 = {
  // eslint-disable-next-line camelcase
  items: V2DatasetItemPayload[]
}

/**
 * Payload structure for the `items_deleted` message received through the
 * dataset channel
 */
export type ItemsDeleted = {
  // eslint-disable-next-line camelcase
  dataset_item_ids: DatasetItemPayload['id'][]
}

export type ItemsDeletedV2 = {
  // eslint-disable-next-line camelcase
  item_ids: V2DatasetItemPayload['id'][]
}
