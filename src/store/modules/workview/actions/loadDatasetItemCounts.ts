import { IsAuthorized } from '@/store/modules/auth/getters/isAuthorized'
import { WorkviewAction } from '@/store/modules/workview/types'
import { sanitizeStatusFilter } from '@/store/modules/workview/utils'
import { DatasetItemCountsPayload, DatasetItemType } from '@/store/types'
import {
  loadDatasetStatusCounts,
  loadDatasetGeneralCounts,
  loadDatasetClassCounts
} from '@/utils/backend'
import { loadDatasetItemCounts as tutorialLoadDatasetItemCounts } from '@/utils/tutorialBackend'

export type LoadDatasetItemCountsActionPayload = {
  openWorkMode: boolean
}

export const loadDatasetItemCounts: WorkviewAction<LoadDatasetItemCountsActionPayload,
 DatasetItemCountsPayload> =
  async ({ commit, state, rootGetters }, payload) => {
    const { dataset } = state
    const { openWorkMode } = payload
    // This action usually gets dispatched by a throttled function, so it will
    // commonly get called on such a delay where the user might navigate away
    // and the dataset is unset. In that case, it should just silently return.
    if (!dataset) { return }

    const { datasetItemFilter } = state

    // num images + num frames of video to annotate as frames + num videos to annotate as videos
    const types = [
      DatasetItemType.image,
      DatasetItemType.videoFrame,
      DatasetItemType.playbackVideo
    ]

    const isAuthorized = rootGetters['auth/isAuthorized'] as IsAuthorized
    const isMoreThanAnnotator = isAuthorized('view_full_datasets') || openWorkMode

    const params = {

      types,
      ...datasetItemFilter,
      statuses: sanitizeStatusFilter(isMoreThanAnnotator, datasetItemFilter.statuses),
      teamSlug: dataset.team_slug,
      datasetSlug: dataset.slug
    }

    if (state.tutorialMode) {
      const response = tutorialLoadDatasetItemCounts({ ...params, datasetId: dataset.id })
      commit('SET_DATASET_ITEM_COUNTS', response.data)
      return response
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
      const data: DatasetItemCountsPayload = {
        status_counts: statusResponse.data,
        ...generalResponse.data,
        class_counts: classResponse.data
      }
      commit('SET_DATASET_ITEM_COUNTS', data)
      return { data }
    }
  }
