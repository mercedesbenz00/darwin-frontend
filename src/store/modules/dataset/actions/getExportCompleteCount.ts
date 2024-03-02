import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetStatusCountsPayload } from '@/store/types/DatasetItemCountsPayload'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { loadDatasetStatusCounts } from '@/utils/backend'

type Action = DatasetAction<{ datasetSlug: string, teamSlug: string }, DatasetStatusCountsPayload[]>

/**
 * Load item completed item counts for a dataset
 * This will be used in the `ExportDialog.vue` component to show the number of `completed` items
 */
export const getExportCompleteCount: Action = async ({ commit }, { datasetSlug, teamSlug }) => {
  const params = {
    datasetSlug,
    teamSlug,
    statuses: [DatasetItemStatus.complete]
  }

  const response = await loadDatasetStatusCounts(params)

  if ('data' in response) {
    const completedCount = response.data.find((a) => a.status === DatasetItemStatus.complete)
    if (!completedCount) {
      throw new Error('Completed count should be in the response of dataset_item counts')
    }
    commit('SET_EXPORT_COMPLETE_COUNT', completedCount.count)
  }
  return response
}
