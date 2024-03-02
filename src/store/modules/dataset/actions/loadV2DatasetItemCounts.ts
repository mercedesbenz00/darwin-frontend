import { DatasetAction } from '@/store/modules/dataset/types'
import {
  DatasetClassCountsPayload,
  DatasetPayload,
  DatasetStatusCountsPayload,
  V2DatasetClassCountsPayload,
  V2DatasetStatusCountsPayload,
  V2DatasetItemFilter
} from '@/store/types'
import { DatasetDetailPayload } from '@/store/types/DatasetDetailPayload'
import {
  loadV2DatasetClassCounts,
  loadV2DatasetGeneralCounts,
  loadV2DatasetStatusCounts
} from '@/utils/backend'
import { errorMessages, parseError } from '@/utils/error'

type Action = DatasetAction<{ dataset: DatasetPayload }, DatasetDetailPayload>

const reformClassCountsPayload =
  (newPayload: V2DatasetClassCountsPayload): DatasetClassCountsPayload[] => {
    const classCounts: DatasetClassCountsPayload[] = []
    if (newPayload && newPayload.simple_counts) {
      newPayload.simple_counts.forEach(countInfo => {
        classCounts.push({
          id: countInfo.annotation_class_id,
          count: countInfo.item_count,
          name: ''
        })
      })
    }
    return classCounts
  }

const reformStatusCountsPayload =
  (newPayload: V2DatasetStatusCountsPayload): DatasetStatusCountsPayload[] => {
    const classCounts: DatasetStatusCountsPayload[] = []
    if (newPayload && newPayload.simple_counts) {
      newPayload.simple_counts.forEach(countInfo => {
        classCounts.push({
          count: countInfo.item_count,
          status: countInfo.status
        })
      })
    }
    return classCounts
  }

/**
 * Load item counts for a dataset
 */
export const loadV2DatasetItemCounts: Action = async (
  { state, getters, commit },
  { dataset }
) => {
  if (!dataset) {
    const error = new Error('Cannot fetch dataset counts with no dataset selected')
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
  const params = {
    teamSlug: dataset.team_slug,
    dataset_ids: [dataset.id],
    ...getters.datasetItemApiFilterV2 as V2DatasetItemFilter
  }
  params.include_thumbnails = undefined
  params.include_workflow_data = undefined
  params.page = undefined
  params.sort = undefined
  params.types = undefined
  params.not_types = undefined

  const [statusResponse, classResponse, generalResponse] = await Promise.all([
    loadV2DatasetStatusCounts({ ...params, statuses: undefined, not_statuses: undefined }),
    loadV2DatasetClassCounts(params),
    loadV2DatasetGeneralCounts(params)
  ])

  if ('error' in statusResponse) { return statusResponse }
  if ('error' in classResponse) { return classResponse }
  if ('error' in generalResponse) { return generalResponse }

  if ('data' in statusResponse && 'data' in classResponse && 'data' in generalResponse) {
    const generalCounts = generalResponse.data
    const details: DatasetDetailPayload = {
      id: dataset.id,
      status_counts: reformStatusCountsPayload(statusResponse.data),
      item_count: generalCounts.simple_counts[0].filtered_item_count,
      commented_item_count: 0,
      unfiltered_item_count: generalCounts.simple_counts[0].unfiltered_item_count,
      class_counts: reformClassCountsPayload(classResponse.data)
    }
    commit('PUSH_DATASET_DETAILS', details)
    if (state.currentDataset.id === details.id) {
      commit('SET_CURRENT_DATASET_DETAILS', details)
    }
    return { data: details }
  }
}
