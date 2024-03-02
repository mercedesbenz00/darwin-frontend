import { computed, ref, Ref, SetupContext } from 'vue'

import { useAuth, useStore, useToast } from '@/composables'
import { addPriorityToV2Items } from '@/store/modules/dataset/actions/addPriorityToV2Items'
import { archiveV2DatasetItems } from '@/store/modules/dataset/actions/archiveV2DatasetItems'
import { assignV2Items } from '@/store/modules/dataset/actions/assignV2Items'
import { deleteV2Annotations } from '@/store/modules/dataset/actions/deleteV2Annotations'
import { deleteV2DatasetItems } from '@/store/modules/dataset/actions/deleteV2DatasetItems'
import { moveV2ItemsToPath } from '@/store/modules/dataset/actions/moveV2ItemsToPath'
import { restoreV2DatasetItems } from '@/store/modules/dataset/actions/restoreV2DatasetItems'
import { setV2Stage } from '@/store/modules/dataset/actions/setV2Stage'
import { resolveOriginalStatus } from '@/store/modules/dataset/utils'
import {
  DatasetDetailPayload,
  DatasetItemStatus,
  DatasetPayload,
  MembershipPayload,
  StoreActionPayload,
  StoreActionResponse,
  V2DatasetItemFilter,
  V2DatasetItemPayload,
  V2WorkflowPayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { errorsByCode } from '@/utils'
import { applyItemChangesV2, resolveUpdatesV2 } from '@/utils/datasetChannel'
import { ErrorCodes } from '@/utils/error/errors'

export interface MenuItemActionSetup {
  isAllArchived: Ref<boolean>
  isAllSelected: Ref<boolean>
  isProcessing: Ref<boolean>
  selectedCount: Ref<number>
  addPriority: (priority: number) => Promise<void>
  archiveItems: () => Promise<void>
  deleteItems: () => Promise<void>
  moveToFolder: (path: string) => void
  setStage: (stage: V2WorkflowStagePayload) => Promise<void>
  restoreItems: () => Promise<void>
  assign: (assignee: MembershipPayload) => Promise<void>
  onSelectAll: (selected: boolean) => void,
  discardAnnotations: () => Promise<void>,
  workflow20: Ref<V2WorkflowPayload | null>
  hasProcessingItems: Ref<boolean>
}

export function useMenuItemAction (
  context: SetupContext,
  dataset: DatasetPayload,
  datasetItems: Ref<V2DatasetItemPayload[]>
): MenuItemActionSetup {
  const { isAuthorized } = useAuth()
  const { commit, dispatch, state } = useStore()
  const toast = useToast()
  const isProcessing = ref(false)
  const isAllSelected = computed(() => state.dataset.selectedAll)

  const selectedItemIds = computed(() => state.dataset.selectedV2ItemIds)

  const filter: Ref<V2DatasetItemFilter> = computed(() => {
    return state.dataset.datasetItemFilterV2
  })

  const actionFilter = computed(() => {
    return isAllSelected.value
      ? { ...filter.value, select_all: true }
      : { item_ids: selectedItemIds.value }
  })

  const details: Ref<DatasetDetailPayload[]> = computed(() => {
    return state.dataset.datasetDetails
  })

  const itemCounts: Ref<DatasetDetailPayload | null> = computed(() => {
    return details.value.find(d => d.id === dataset.id) || null
  })

  const folderEnabled: Ref<boolean> = computed(() => {
    return state.dataset.folderEnabled
  })

  const itemCountsByStatus = (status: DatasetItemStatus): number => {
    return itemCounts.value?.status_counts.find(c => c.status === status)?.count || 0
  }

  /**
   * Returns the currently selected items.
   *
   * Can be used by parent components through a reference.
   */
  const selectedItems = computed(() => {
    return datasetItems.value.filter(i => selectedItemIds.value.includes(i.id))
  })

  const statuses = computed(() => {
    return filter.value.statuses || []
  })

  const hasProcessingItems = computed(() => {
    if (isAllSelected.value) {
      return (
        itemCountsByStatus(DatasetItemStatus.processing) +
        itemCountsByStatus(DatasetItemStatus.uploading)
      ) > 0
    } else {
      return selectedItems.value.some(i =>
        [DatasetItemStatus.processing, DatasetItemStatus.uploading].includes(i.status)
      )
    }
  })

  /**
   * Determines if it's safe to use "delete all" within the current selection.
   * We need to be careful with this, since it has potential to delete all items
   * in the dataset, so we only allow deletion in one of two cases
   *
   * 1. Individual selection and all selected items are archived
   * 2. "Select All", all items loaded and all items are archived
   * 3. "Select All", not all items loaded, but filter would only list archived items.
   */
  const isAllArchived = computed(() => {
    // we are selecting all, all items are loaded and all of them are archived
    if (
      isAllSelected.value &&
      itemCounts.value &&
      datasetItems.value.length === itemCounts.value.item_count &&
      datasetItems.value.every(i => i.archived)
    ) {
      return true
    }

    // not all items necessarily loaded, but the current filter would only select archived items
    const isFilterArchiveOnly =
      (statuses.value.length === 1) && (statuses.value[0] === DatasetItemStatus.archived)
    if (isAllSelected.value && isFilterArchiveOnly) {
      return true
    }

    // individual selection is active, all selected items are archived
    if (
      !isAllSelected.value &&
      selectedItems.value.length &&
      selectedItems.value.every(i => i.archived)
    ) {
      return true
    }

    return false
  })

  const selectedCount = computed(() => {
    if (isAllSelected.value && itemCounts.value) { return itemCounts.value.item_count }
    if (!isAllSelected.value) { return selectedItemIds.value.length }
    return -1
  })

  const canArchive = computed(() => {
    return isAuthorized(
      'archive_dataset_items',
      { subject: 'dataset', resource: dataset },
      ['member', 'workforce_manager', 'admin', 'owner']
    )
  })

  const canDelete = computed(() => {
    return isAuthorized(
      'delete_dataset_items',
      { subject: 'dataset', resource: dataset },
      ['member', 'workforce_manager', 'admin', 'owner']
    )
  })

  const onSelectAll = (selected: boolean): void => {
    commit('dataset/SET_SELECTED_ALL_ITEMS', selected)
    if (selected) {
      const selectedDatasetItemsId = datasetItems.value.map(d => d.id)
      commit('dataset/SET_SELECTED_ITEMS', selectedDatasetItemsId)
    } else {
      commit('dataset/SET_SELECTED_ITEMS', [])
    }
  }

  const deselectAll = (): void => {
    commit('dataset/SET_SELECTED_ALL_ITEMS', false)
    commit('dataset/SET_SELECTED_ITEMS', [])
  }

  const applyChange = (newItems: V2DatasetItemPayload[]): void => {
    const changes = resolveUpdatesV2(
      datasetItems.value,
      newItems,
      filter.value,
      folderEnabled.value
    )
    const newDatasetItems = applyItemChangesV2(changes, datasetItems.value)

    context.emit('update:dataset-items', newDatasetItems)
  }

  const removeInvalidSelectAllParams = (
    filter: Omit<V2DatasetItemFilter, 'dataset_ids'>
  ): Omit<V2DatasetItemFilter, 'dataset_ids'> => {
    return isAllSelected.value
      ? {
        ...filter,
        item_ids: undefined,
        include_thumbnails: undefined,
        include_workflow_data: undefined,
        page: undefined,
        sort: undefined
      }
      : filter
  }

  const archiveItems = async (): Promise<void> => {
    if (!canArchive.value) {
      const content = errorsByCode.DATASET_IMAGE_DELETE_NOT_AUTHORIZED
      return toast.warning({ meta: { title: content } })
    }

    if (selectedItems.value.length === 0) { return }

    const params: StoreActionPayload<typeof archiveV2DatasetItems> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value })
    }

    isProcessing.value = true
    const response = await dispatch('dataset/archiveV2DatasetItems', params)
    isProcessing.value = false

    if ('error' in response) {
      return toast.warning({ meta: { title: response.error.message } })
    }

    const newItems = datasetItems.value.reduce((newArray, item) => {
      if (isAllSelected.value || selectedItemIds.value.includes(item.id)) {
        newArray.push({ ...item, status: DatasetItemStatus.archived, archived: true })
      }
      return newArray
    }, [] as V2DatasetItemPayload[])
    applyChange(newItems)

    deselectAll()
  }

  const restoreItems = async (): Promise<void> => {
    if (!canArchive.value) {
      const content = errorsByCode.DATASET_IMAGE_RESTORE_NOT_AUTHORIZED
      return toast.warning({ meta: { title: content } })
    }
    if (!isAllSelected.value && selectedItems.value.length === 0) { return }

    const params: StoreActionPayload<typeof restoreV2DatasetItems> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value })
    }

    isProcessing.value = true
    const response = await dispatch('dataset/restoreV2DatasetItems', params)
    isProcessing.value = false

    if ('error' in response) {
      return toast.warning({ meta: { title: response.error.message } })
    }

    const newItems = datasetItems.value.reduce((newArray, item) => {
      if (isAllSelected.value || selectedItemIds.value.includes(item.id)) {
        newArray.push({ ...item, status: resolveOriginalStatus(item), archived: false })
      }
      return newArray
    }, [] as V2DatasetItemPayload[])
    applyChange(newItems)

    deselectAll()
  }

  const deleteItems = async (): Promise<void> => {
    if (!canDelete.value) {
      const content = errorsByCode.DATASET_IMAGE_RESTORE_NOT_AUTHORIZED
      return toast.warning({ meta: { title: content } })
    }

    if (selectedItems.value.length === 0) { return }

    const params: StoreActionPayload<typeof deleteV2DatasetItems> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value })
    }
    isProcessing.value = true
    const response = await dispatch('dataset/deleteV2DatasetItems', params)
    isProcessing.value = false

    if ('error' in response) {
      return toast.warning({ meta: { title: response.error.message } })
    }

    if (isAllSelected.value) {
      context.emit('update:dataset-items', [])
    } else {
      const newDatasetItems =
        datasetItems.value.filter(item => !selectedItemIds.value.includes(item.id))
      context.emit('update:dataset-items', newDatasetItems)
    }

    deselectAll()
  }

  const addPriority = async (priority: number): Promise<void> => {
    if (selectedItems.value.length === 0) { return }

    const params: StoreActionPayload<typeof addPriorityToV2Items> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value }),
      priority
    }

    isProcessing.value = true
    const { error } = await dispatch('dataset/addPriorityToV2Items', params)
    isProcessing.value = false
    if (error) { return toast.warning({ meta: { title: error.message } }) }

    const newItems = datasetItems.value.reduce((newArray, item) => {
      if (isAllSelected.value || selectedItemIds.value.includes(item.id)) {
        newArray.push({ ...item, priority })
      }
      return newArray
    }, [] as V2DatasetItemPayload[])

    applyChange(newItems)
    toast.success({ meta: { title: 'Priority has been successfully added to items' } })

    deselectAll()
  }

  const moveToFolder = async (path: string): Promise<void> => {
    if (selectedItems.value.length === 0) { return }

    const params: StoreActionPayload<typeof moveV2ItemsToPath> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value }),
      path
    }
    isProcessing.value = true
    const { error } = await dispatch('dataset/moveV2ItemsToPath', params)
    isProcessing.value = false
    if (error) { return toast.warning({ meta: { title: error.message } }) }

    const newItems = datasetItems.value.reduce((newArray, item) => {
      if (isAllSelected.value || selectedItemIds.value.includes(item.id)) {
        newArray.push({ ...item, path })
      }
      return newArray
    }, [] as V2DatasetItemPayload[])

    applyChange(newItems)

    toast.success({ meta: { title: 'Items successfully moved!' } })
    deselectAll()
  }

  const assign = async (assignee: MembershipPayload): Promise<void> => {
    const workflow =
      state.v2Workflow.workflows.find(
        w => w.stages.some(s => 'dataset_id' in s.config && s.config.dataset_id === dataset.id)
      )
    if (!workflow) { throw new Error('Dataset not associated to any known workflow') }

    if (selectedItems.value.length === 0) { return }
    const payload: StoreActionPayload<typeof assignV2Items> = {
      assignee: assignee,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value }),
      dataset,
      workflow
    }

    isProcessing.value = true
    const response:
      StoreActionResponse<typeof assignV2Items> = await dispatch('dataset/assignV2Items', payload)
    isProcessing.value = false

    if ('error' in response) {
      const { error } = response

      if (error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
        return commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      }

      const content = error.backendMessage as string || error.message as string
      return toast.warning({ meta: { title: content } })
    }

    toast.success({ meta: { title: 'Items successfully assigned' } })
    deselectAll()
  }

  // workflows 2.0
  const workflow20: Ref<V2WorkflowPayload | null> = computed(() => {
    const workflow = state.v2Workflow.workflows.find(
      w => w.stages.some(
        s => 'dataset_id' in s.config && s.config.dataset_id === dataset.id
      )
    ) || null

    return workflow
  })

  const setStage = async (stage: V2WorkflowStagePayload): Promise<void> => {
    const workflow =
      state.v2Workflow.workflows.find(
        w => w.stages.some(s => 'dataset_id' in s.config && s.config.dataset_id === dataset.id)
      )
    if (!workflow) { throw new Error('Dataset not associated to any known workflow') }

    if (selectedItems.value.length === 0 && !isAllSelected.value) { return }

    const payload: StoreActionPayload<typeof setV2Stage> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value }),
      stage,
      workflow
    }

    isProcessing.value = true
    const response = await dispatch(
      'dataset/setV2Stage',
      payload
    ) as StoreActionResponse<typeof setV2Stage>
    isProcessing.value = false

    if ('error' in response) {
      const { error } = response

      if (error.code === ErrorCodes.OUT_OF_SUBSCRIBED_STORAGE) {
        return commit('billing/SHOW_OUT_OF_STORAGE_DIALOG')
      }

      const content = error.backendMessage as string || error.message as string
      return toast.warning({ meta: { title: content } })
    }

    toast.success({ meta: { title: `Items successfully moved to stage ${stage.name}` } })
    deselectAll()
  }

  const discardAnnotations = async (): Promise<void> => {
    const workflow =
      state.v2Workflow.workflows.find(
        w => w.stages.some(s => 'dataset_id' in s.config && s.config.dataset_id === dataset.id)
      )
    if (!workflow) { throw new Error('Dataset not associated to any known workflow') }

    const payload: StoreActionPayload<typeof deleteV2Annotations> = {
      dataset,
      filters: removeInvalidSelectAllParams({ ...actionFilter.value }),
      workflow
    }

    if (selectedItems.value.length === 0 && !isAllSelected.value) { return }

    const response: StoreActionResponse<typeof deleteV2Annotations> =
      await dispatch('dataset/deleteV2Annotations', payload)

    if ('error' in response) {
      const { error } = response
      const content = error.backendMessage || error.message
      return dispatch('toast/warning', { content })
    }

    dispatch('toast/notify', { content: 'Annotations successfully cleared' })
    deselectAll()
  }

  return {
    selectedCount,
    isProcessing,
    addPriority,
    archiveItems,
    assign,
    deleteItems,
    discardAnnotations,
    isAllArchived,
    isAllSelected,
    moveToFolder,
    onSelectAll,
    restoreItems,
    setStage,
    workflow20,
    hasProcessingItems
  }
}
