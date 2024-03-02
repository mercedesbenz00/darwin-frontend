import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { constructError } from '@/utils'
import { moveDatasetItemsToNew } from '@/utils/backend'

const noDatasetError = constructError(
  'DATASET_NOT_SELECTED',
  [
    'Cannot resolve current dataset.',
    'It might still be loading. Wait a bit and try again.',
    'If that fails, try refreshing the page.'
  ].join(' ')
)

/**
 * Resets all selected items to the "new" status.
 *
 * This will discard any annotations on the items, as well as moving the status
 * back to new, so it should be put behind a confirmation dialog
 */
export const moveSelectedItemsToNew: DatasetAction<void, void> = async (
  { commit, state }
) => {
  const { currentDataset, datasetItemFilter, selectedItemIds, selectedAll } = state

  if (!currentDataset.id) {
    return noDatasetError
  }
  const filter: DatasetItemFilter = selectedAll
    ? datasetItemFilter
    : { dataset_item_ids: selectedItemIds }

  const params: Parameters<typeof moveDatasetItemsToNew>[0] = {
    datasetId: currentDataset.id,
    filter
  }

  const response = await moveDatasetItemsToNew(params)

  if (!('error' in response)) {
    const items = selectedAll
      ? state.datasetItems
      : state.datasetItems.filter(i => selectedItemIds.includes(i.id))

    commit('SET_ITEM_STATUS', { items, status: DatasetItemStatus.new })
  }

  return response
}
