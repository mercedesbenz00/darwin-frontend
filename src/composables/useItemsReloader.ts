import { computed, ref, watch, Ref } from 'vue'

import {
  loadV2DatasetItemCountsThrottled
} from '@/store/modules/dataset/actions/loadV2DatasetItemCountsThrottled'
import { DatasetPayload, StoreActionPayload, V2DatasetItemPayload } from '@/store/types'
import {
  applyItemChangesV2,
  ItemsDeletedV2,
  ItemsUpdatedV2,
  resolveUpdatesV2 } from '@/utils/datasetChannel'

import { useDatasetChannel } from './useDatasetChannel'
import { useStore } from './useStore'

/**
 * Wraps around `useDatasetChannel` to automatically reload items and stats when
 * an update message is received
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useItemsReloader = (datasetItems: Ref<V2DatasetItemPayload[]>) => {
  const { commit, dispatch, state } = useStore()

  const folderEnabled = computed<boolean>(() => state.dataset.folderEnabled)
  const datasetItemFilter = computed(() => state.dataset.datasetItemFilterV2)
  const selectedItemIds = computed(() => state.dataset.selectedV2ItemIds)
  const currentDataset = computed(() => state.dataset.currentDataset)
  const datasetPayload = computed(() =>
    state.dataset.datasets.find(
      (d: DatasetPayload) => d.id === state.dataset.currentDataset.id
    )
  )

  const datasetIds = computed(() => {
    if (!currentDataset.value?.id) { return [] }
    return [currentDataset.value.id]
  })

  const channelDatasetItems: Ref<V2DatasetItemPayload[]> = ref(datasetItems.value)
  watch(datasetItems, () => channelDatasetItems.value = datasetItems.value, { immediate: true })

  const reloadStats = (): void => {
    if (!datasetPayload.value) { return }

    const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = {
      dataset: datasetPayload.value
    }

    dispatch('dataset/loadV2DatasetItemCountsThrottled', countsPayload)

    if (folderEnabled.value) {
      dispatch('dataset/loadV2DatasetFoldersThrottled', {
        datasetId: datasetPayload.value.id,
        teamSlug: datasetPayload.value.team_slug
      })
    }
  }

  const onItemsUpdated = (payload: ItemsUpdatedV2): void => {
    if (!currentDataset.value?.id) { return }
    if (payload.items.length === 0) { return }

    const item = payload.items[0]
    if (item.dataset_id !== currentDataset.value.id) { return }

    const changes = resolveUpdatesV2(
      datasetItems.value,
      payload.items,
      datasetItemFilter.value,
      folderEnabled.value
    )

    reloadStats()

    const newDatasetItems = applyItemChangesV2(changes, datasetItems.value)
    channelDatasetItems.value = newDatasetItems
  }

  const onItemsDeleted = (payload: ItemsDeletedV2): void => {
    if (!currentDataset.value?.id) { return }

    const { item_ids: ids } = payload
    const newDatasetItems = datasetItems.value.filter(i => !ids.includes(i.id))
    const selectedIds = selectedItemIds.value.filter(id => !ids.includes(id))

    reloadStats()

    commit('dataset/SET_SELECTED_ITEMS', selectedIds)
    channelDatasetItems.value = newDatasetItems
  }

  useDatasetChannel(datasetIds, {
    onItemsUpdated,
    onItemsDeleted
  })

  return {
    channelDatasetItems
  }
}
