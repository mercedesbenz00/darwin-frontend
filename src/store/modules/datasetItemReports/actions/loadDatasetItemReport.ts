import { DatasetItemReportsAction } from '@/store/modules/datasetItemReports/types'
import { loadDatasetItemReport as request } from '@/utils/backend/loadDatasetItemReport'

type Action = DatasetItemReportsAction<{ reportId: string }>

/**
 * Fetch report item from the API
 * and set it to the store
 *
 * @param {object} params
 * @param {string} params.reportId
 */
export const loadDatasetItemReport: Action = async ({ commit, rootState }, { reportId }) => {
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
    reportId
  }
  const response = await request(payload)

  if ('error' in response) { return response }

  if ('data' in response) {
    commit('SET_REPORT', response.data)
  }

  return response
}
