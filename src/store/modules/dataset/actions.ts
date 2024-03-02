import { ActionTree } from 'vuex'

import { DatasetPayload, RootState } from '@/store/types'
import { DatasetItemType } from '@/store/types/DatasetItemType'
import { handleError, api, errorMessages, parseError, isErrorResponse } from '@/utils'

import { addPriorityToItems } from './actions/addPriorityToItems'
import { addPriorityToV2Items } from './actions/addPriorityToV2Items'
import { advanceSelectedItemsToNextStage } from './actions/advanceSelectedItemsToNextStage'
import { archiveDatasetItems } from './actions/archiveDatasetItems'
import { archiveV2DatasetItems } from './actions/archiveV2DatasetItems'
import { assignItems } from './actions/assignItems'
import { assignV2Items } from './actions/assignV2Items'
import { confirmFileUpload, confirmFileUploadV2 } from './actions/confirmFileUpload'
import { createWorkflowTemplate } from './actions/createWorkflowTemplate'
import { deleteDatasetItems } from './actions/deleteDatasetItems'
import { deleteExport } from './actions/deleteExport'
import { deleteV2Annotations } from './actions/deleteV2Annotations'
import { deleteV2DatasetItems } from './actions/deleteV2DatasetItems'
import { deleteV2Export } from './actions/deleteV2Export'
import { exportDataset } from './actions/exportDataset'
import { exportV2Dataset } from './actions/exportV2Dataset'
import { getDatasets } from './actions/getDatasets'
import { getExportCompleteCount } from './actions/getExportCompleteCount'
import { getReport } from './actions/getReport'
import { getV2Exports } from './actions/getV2Exports'
import { initV2DatasetItems } from './actions/initV2DatasetItems'
import { joinChannel } from './actions/joinChannel'
import { leaveChannel } from './actions/leaveChannel'
import {
  loadAllDatasetItems,
  stopLoadingAllDatasetItems,
  restartLoadingAllDatasetItems
} from './actions/loadAllDatasetItems'
import loadAndSelectDatasetDetails from './actions/loadAndSelectDatasetDetails'
import { loadDatasetFolders } from './actions/loadDatasetFolders'
import { loadDatasetFoldersThrottled } from './actions/loadDatasetFoldersThrottled'
import { loadDatasetItemCounts } from './actions/loadDatasetItemCounts'
import { loadDatasetItemCountsThrottled } from './actions/loadDatasetItemCountsThrottled'
import { loadV2DatasetFolders } from './actions/loadV2DatasetFolders'
import { loadV2DatasetFoldersThrottled } from './actions/loadV2DatasetFoldersThrottled'
import { loadV2DatasetItem } from './actions/loadV2DatasetItem'
import { loadV2DatasetItemCounts } from './actions/loadV2DatasetItemCounts'
import { loadV2DatasetItemCountsThrottled } from './actions/loadV2DatasetItemCountsThrottled'
import { loadV2DatasetItemsList } from './actions/loadV2DatasetItemsList'
import { loadV2DatasetItemsListThrottled } from './actions/loadV2DatasetItemsListThrottled'
import { loadWorkflowTemplate } from './actions/loadWorkflowTemplate'
import { loadWorkflowTemplates } from './actions/loadWorkflowTemplates'
import loadWorkforceManagers from './actions/loadWorkforceManagers'
import { markSelectedItemsCompleted } from './actions/markSelectedItemsCompleted'
import { moveItemsToPath } from './actions/moveItemsToPath'
import { moveSelectedItemsToNew } from './actions/moveSelectedItemsToNew'
import { moveV2ItemsToPath } from './actions/moveV2ItemsToPath'
import { refreshV2DatasetItemStage } from './actions/refreshV2DatasetItemStage'
import { resetSelectedItemsToNew } from './actions/resetSelectedItemsToNew'
import { restoreDatasetItems } from './actions/restoreDatasetItems'
import { restoreV2DatasetItems } from './actions/restoreV2DatasetItems'
import { searchFilenames } from './actions/searchFilenames'
import { searchFilenamesThrottled } from './actions/searchFilenamesThrottled'
import { searchFilenamesThrottledV2 } from './actions/searchFilenamesThrottledV2'
import { searchFilenamesV2 } from './actions/searchFilenamesV2'
import { setDatasetItemFilter } from './actions/setDatasetItemFilter'
import { setDatasetItemFilterV2 } from './actions/setDatasetItemFilterV2'
import { setDefaultWorkflowTemplate } from './actions/setDefaultWorkflowTemplate'
import { setFolderEnabled } from './actions/setFolderEnabled'
import { setV2Stage } from './actions/setV2Stage'
import { tagSelectedItems } from './actions/tagSelectedItems'
import { tagSelectedItemsV2 } from './actions/tagSelectedItemsV2'
import { untagSelectedItems } from './actions/untagSelectedItems'
import { untagSelectedItemsV2 } from './actions/untagSelectedItemsV2'
import updateDataset from './actions/updateDataset'
import { updateDatasetData, updateDatasetDataV2 } from './actions/updateDatasetData'
import { updateWorkflowStageTemplate } from './actions/updateWorkflowStageTemplate'
import { DatasetState } from './state'

type Actions = ActionTree<DatasetState, RootState>

// actions
export const actions: Actions = {
  addPriorityToItems,
  addPriorityToV2Items,
  advanceSelectedItemsToNextStage,
  archiveDatasetItems,
  archiveV2DatasetItems,
  assignItems,
  assignV2Items,
  confirmFileUpload,
  confirmFileUploadV2,
  createWorkflowTemplate,
  deleteDatasetItems,
  deleteV2DatasetItems,
  deleteExport,
  deleteV2Export,
  deleteV2Annotations,
  exportDataset,
  exportV2Dataset,
  getExportCompleteCount,
  getDatasets,
  getReport,
  getV2Exports,
  joinChannel,
  leaveChannel,
  loadAllDatasetItems,
  loadAndSelectDatasetDetails,
  loadDatasetFolders,
  loadV2DatasetFolders,
  loadDatasetFoldersThrottled,
  loadDatasetItemCounts,
  loadDatasetItemCountsThrottled,
  loadWorkflowTemplate,
  loadWorkflowTemplates,
  loadWorkforceManagers,
  loadV2DatasetItemCounts,
  loadV2DatasetItemCountsThrottled,
  loadV2DatasetItemsList,
  loadV2DatasetItemsListThrottled,
  loadV2DatasetItem,
  refreshV2DatasetItemStage,
  initV2DatasetItems,
  loadV2DatasetFoldersThrottled,
  markSelectedItemsCompleted,
  moveItemsToPath,
  moveSelectedItemsToNew,
  moveV2ItemsToPath,
  resetSelectedItemsToNew,
  restartLoadingAllDatasetItems,
  restoreDatasetItems,
  restoreV2DatasetItems,
  searchFilenames,
  searchFilenamesV2,
  searchFilenamesThrottled,
  searchFilenamesThrottledV2,
  setDatasetItemFilter,
  setDatasetItemFilterV2,
  setDefaultWorkflowTemplate,
  setFolderEnabled,
  setV2Stage,
  stopLoadingAllDatasetItems,
  tagSelectedItems,
  tagSelectedItemsV2,
  untagSelectedItems,
  untagSelectedItemsV2,
  updateDataset,
  updateDatasetData,
  updateDatasetDataV2,
  updateWorkflowStageTemplate,
  /**
   * Fetch a dataset from the backend, either by id, or by teamSlug/datasetSlug
   *
   * This includes standard dataset fields, as well as some of the count/stat fields.
   *
   * It also includes annotation classes
   */
  async loadDataset ({ commit }, { datasetId, teamSlug, datasetSlug }) {
    const path = datasetId !== undefined
      ? `datasets/${datasetId}`
      : `${teamSlug}/${datasetSlug}`

    let response

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return handleError(this, error, errorMessages.DATASET_LOAD)
    }
    const { data } = response
    if (teamSlug) { data.team_slug = teamSlug }
    commit('PUSH_DATASET', data)
    return { data }
  },

  async getVideoItemInfo ({ commit }, { datasetId, datasetVideoId }) {
    const params = {
      video_ids: [datasetVideoId],
      types: [DatasetItemType.splitVideo]
    }
    let response

    try {
      response = await api.get(`datasets/${datasetId}/items`, params)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.DATASET_LOAD)
    }

    const { data } = response
    if (data.length === 0) {
      return { data: null }
    }

    commit('SET_CURRENT_DATASET_VIDEO_ITEM', data[0])
    return { data: data[0] }
  },

  /**
   * Get DatasetExports
   */
  async getDatasetExports ({ commit }, params) {
    let response
    try {
      response = await api.get(`datasets/${params.datasetId}/exports`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.DATASET_EXPORT)
    }
    const { data } = response
    commit('SET_DATASET_EXPORTS', data)
    return { data }
  },

  /**
   * Pick an existing dataset
   * @param id Existing Dataset Id
   */
  async forkDataset ({ commit }, { parentId, childId }) {
    const endpoint = `datasets/${parentId}/fork/${childId}`

    let result
    try {
      result = await api.post(endpoint, {})
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return handleError(this, error, errorMessages.DATASET_FORK)
    }

    const { data } = result
    commit('PUSH_DATASET', data)
    return { data }
  },

  /**
   * Resets current dataset
   */
  resetCurrentDataset ({ commit }) {
    commit('RESET_CURRENT_DATASET')
  },

  /**
   * Create a new dataset
   * @param annotators The list of annotators
   */
  async createDataset ({ commit, rootState }, { name, isPublic }) {
    const { currentTeam } = rootState.team
    if (!currentTeam) { throw new Error('Attempted to create dataset without a selected team') }

    const createParams = {
      name,
      public: isPublic,
      team_id: currentTeam.id
    }

    let response

    try {
      response = await api.post('datasets', createParams)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return handleError(this, error, errorMessages.DATASET_CREATE)
    }

    const { data } = response

    commit('PUSH_DATASET', data)

    return { data }
  },

  /**
   * Delete a dataset
   */
  async deleteDataset ({ commit }, dataset: DatasetPayload) {
    const { data } = await api.put(`datasets/${dataset.id}/archive`)
    commit('REMOVE_DATASET', dataset)
    return data
  },

  /**
   * @params datasetId Dataset Id
   */
  async getAnnotators ({ commit }, { datasetId }) {
    let response
    try {
      response = await api.get(`datasets/${datasetId}/annotators`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return handleError(this, error, errorMessages.DATASET_LOAD)
    }
    const { data } = response
    commit('PUSH_ANNOTATORS_FOR_DATASET', { datasetId, data })
    return { data }
  }
}
