import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetReportPayload } from '@/store/types/DatasetReportPayload'
import { loadDatasetReport } from '@/utils/backend'
type Action = DatasetAction<{ datasetId: number }, DatasetReportPayload>

/**
 * Retrieves report (additional information for a dataset)
 */
export const getReport: Action = async ({ commit }, payload) => {
  const { datasetId } = payload
  const response = await loadDatasetReport({ datasetId })
  if ('data' in response) {
    commit('PUSH_REPORT', response.data)
  }
  return response
}
