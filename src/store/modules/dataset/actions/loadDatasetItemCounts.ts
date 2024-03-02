import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload } from '@/store/types'
import { DatasetDetailPayload } from '@/store/types/DatasetDetailPayload'
import {
  loadDatasetStatusCounts,
  loadDatasetGeneralCounts,
  loadDatasetClassCounts
} from '@/utils/backend'
import { errorMessages, parseError } from '@/utils/error'

type Action = DatasetAction<{ dataset: DatasetPayload }, DatasetDetailPayload>

/**
 * Load item counts for a dataset
 */
export const loadDatasetItemCounts: Action = async (
  { state, getters, commit },
  { dataset }
) => {
  if (!dataset) {
    const error = new Error('Cannot fetch dataset counts with no dataset selected')
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
  const params = {
    datasetSlug: dataset.slug,
    teamSlug: dataset.team_slug,
    ...getters.datasetItemApiFilter as DatasetItemFilter
  }

  const [statusResponse, generalResponse, classResponse] = await Promise.all([
    loadDatasetStatusCounts(params),
    loadDatasetGeneralCounts(params),
    loadDatasetClassCounts(params)
  ])

  if ('error' in statusResponse) { return statusResponse }
  if ('error' in generalResponse) { return generalResponse }
  if ('error' in classResponse) { return classResponse }

  if ('data' in statusResponse && 'data' in generalResponse && 'data' in classResponse) {
    const details: DatasetDetailPayload = {
      id: dataset.id,
      status_counts: statusResponse.data,
      ...generalResponse.data,
      class_counts: classResponse.data
    }
    commit('PUSH_DATASET_DETAILS', details)
    if (state.currentDataset.id === details.id) {
      commit('SET_CURRENT_DATASET_DETAILS', details)
    }
    return { data: details }
  }
}
