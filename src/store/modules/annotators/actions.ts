import { AxiosResponse } from 'axios'
import { ActionTree } from 'vuex'

import { AnnotationDataGranularity } from '@/components/Annotators/AnnotationMetrics/types'
import {
  ApiResponse,
  DatasetPayload,
  DatasetReportPayload,
  RootState,
  TypedAction
} from '@/store/types'
import { api, parseError, errorMessages, downloadFile, isErrorResponse } from '@/utils'

import { AnnotatorsState, AnnotationReportParams, AnnotationReport } from './types'

type AnnotatorStatsAction<P, T = any> = TypedAction<AnnotatorsState, RootState, P, T>

type LoadDatasetReportAction = AnnotatorStatsAction<
  DatasetPayload,
  DatasetReportPayload
>

/**
 * Delegate to dataset/getReport, adapting parameters on dispatch
 */
const loadDatasetReport: LoadDatasetReportAction = ({ dispatch }, dataset) =>
  dispatch('dataset/getReport', { datasetId: dataset.id }, { root: true })

type GetAnnotationReportParams = {
  dataset: DatasetPayload
  granularity: AnnotationDataGranularity
  groupBy: string
  from: string
}

type GetAnnotationReportAction =
  AnnotatorStatsAction<GetAnnotationReportParams, ApiResponse<AnnotationReport>>

/**
 * Get an annotation report for a dataset as JSON
 */
const getAnnotationReport: GetAnnotationReportAction = async ({ commit, rootState }, params) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) { throw Error('Attempted to fetch annotation report without a selected team') }

  const queryParams = {
    group_by: params.groupBy || 'dataset',
    dataset_ids: params.dataset.id,
    granularity: params.granularity || 'hour',
    ...(params.from && { from: params.from })
  }

  let response

  try {
    response = await api.get(`reports/${currentTeam.id}/annotation`, queryParams)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    // backend will return a JSON payload in case of an error,
    // so we need to convert the arraybuffer to json
    return parseError(error, errorMessages.REPORT_LOAD)
  }

  const mutationParams: AnnotationReportParams = {
    groupBy: queryParams.group_by,
    datasetId: queryParams.dataset_ids,
    granularity: params.granularity || 'hour',
    from: params.from ? params.from : null
  }

  commit('PUSH_ANNOTATION_REPORT', { data: response.data, params: mutationParams })

  return response
}

type DownloadAnnotationReportParams = {
  dataset: DatasetPayload
  granularity: AnnotationDataGranularity
  groupBy: string
  from: string
}

type DownloadAnnotationReportAction =
  AnnotatorStatsAction<DownloadAnnotationReportParams, ApiResponse<AnnotationReport>>

/**
 * Download an annotation report as CSV
 */
const downloadAnnotationReport: DownloadAnnotationReportAction = async ({ rootState }, params) => {
  const { dataset, granularity } = params
  const { currentTeam } = rootState.team
  if (!currentTeam) {
    throw Error('Attempted to download annotation report without a selected team.')
  }

  const queryParams = {
    group_by: 'dataset,user',
    dataset_ids: dataset.id,
    granularity,
    format: 'csv',
    include: 'dataset.name,user.first_name,user.last_name,user.email'
  }

  let response: AxiosResponse
  try {
    response = await api.download(`reports/${currentTeam.id}/annotation`, { params: queryParams })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    // backend will return a JSON payload in case of an error,
    // so we need to convert the arraybuffer to json
    return parseError(error, errorMessages.REPORT_DOWNLOAD)
  }

  const filename = `${currentTeam.name}_${dataset.name}_by_${granularity}.csv`
  downloadFile(response, filename)

  return { data: response }
}

export const actions: ActionTree<AnnotatorsState, RootState> = {
  loadDatasetReport,
  getAnnotationReport,
  downloadAnnotationReport
}
