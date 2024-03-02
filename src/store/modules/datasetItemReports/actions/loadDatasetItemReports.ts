import { DatasetItemReportsAction } from '@/store/modules/datasetItemReports/types'
import { loadDatasetItemReports as request } from '@/utils/backend/loadDatasetItemReports'

type Action = DatasetItemReportsAction<void>

/**
 * Fetch reports array from the API
 * and set it to the store
 */
export const loadDatasetItemReports: Action = async ({ commit, rootState }) => {
  const { currentDataset, datasets } = rootState.dataset
  if (!currentDataset.id) {
    throw Error('Attempted to download dataset item report without a dataset selected.')
  }

  const dataset = datasets.find(d => d.id === currentDataset.id)
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
    commit('SET_REPORTS', response.data)
  }

  return response
}
