import { DatasetItemReportsAction } from '@/store/modules/datasetItemReports/types'
import { deleteDatasetItemReport as request } from '@/utils/backend/deleteDatasetItemReport'

type Action = DatasetItemReportsAction<{ reportId: string }>

/**
 * Send delete report request to the API
 * and remove it from the store
 *
 * @param {object} params
 * @param {string} params.reportId
 * @returns
 */
export const deleteDatasetItemReport: Action = async ({ commit, rootState }, params) => {
  const { currentDataset } = rootState.dataset
  if (!currentDataset.id) {
    throw Error('Attempted to download dataset item report without a dataset selected.')
  }

  const dataset = rootState.dataset.datasets.find(d => d.id === currentDataset.id)
  if (!dataset) {
    throw Error('Attempted to download dataset item report without a dataset loaded.')
  }

  if (!dataset.team_slug) {
    throw Error('Loaded dataset is missing a team_slug key.')
  }

  const payload = {
    teamSlug: dataset.team_slug,
    datasetSlug: dataset.slug,
    reportId: params.reportId
  }
  const response = await request(payload)

  if ('error' in response) { return response }

  commit('DELETE_REPORT', params.reportId)

  return response
}
