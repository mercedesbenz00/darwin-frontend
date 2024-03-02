import { DatasetItemReportsAction } from '@/store/modules/datasetItemReports/types'
import { createDatasetItemReport as request } from '@/utils/backend/createDatasetItemReport'

type Action = DatasetItemReportsAction<void>

/**
 * Request report creation from the API
 * and push new item to the store
 */
export const createDatasetItemReport: Action = async ({ commit, rootState }) => {
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
    datasetSlug: dataset.slug
  }
  const response = await request(payload)

  if ('error' in response) { return response }

  if ('data' in response) {
    commit('PUSH_REPORT', response.data)
  }

  return response
}
