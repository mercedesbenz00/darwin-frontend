import { ActionTree } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { RootState } from '@/store/types'

import { approveStage } from './approveStage'
import { approveV2ReviewStage } from './approveV2ReviewStage'
import { archiveStage } from './archiveStage'
import { assignStage } from './assignStage'
import { assignV2Stage } from './assignV2Stage'
import { cancelStageAutoComplete } from './cancelStageAutoComplete'
import { cancelV2StageAutoComplete } from './cancelV2StageAutoComplete'
import copyStageAnnotations from './copyStageAnnotations'
import { copyV2StageAnnotations } from './copyV2StageAnnotations'
import createStageAnnotation from './createStageAnnotation'
import { createV2Annotation } from './createV2Annotation'
import { createWorkflow } from './createWorkflow'
import deleteAllVisibleStageAnnotations from './deleteAllVisibleStageAnnotations'
import { deletePreset } from './deletePreset'
import deleteStageAnnotation from './deleteStageAnnotation'
import deleteStageAnnotations from './deleteStageAnnotations'
import { deleteV2Annotation } from './deleteV2Annotation'
import { joinChannel } from './joinChannel'
import { joinV2WorkflowsChannel } from './joinV2WorkflowsChannel'
import { leaveChannel } from './leaveChannel'
import { leaveV2WorkflowsChannel } from './leaveV2WorkflowsChannel'
import loadAutoAnnotateModels from './loadAutoAnnotateModels'
import loadCommentThreads from './loadCommentThreads'
import loadDataset from './loadDataset'
import { loadDatasetFolders } from './loadDatasetFolders'
import { loadDatasetFoldersThrottled } from './loadDatasetFoldersThrottled'
import { loadDatasetItemCounts } from './loadDatasetItemCounts'
import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'
import loadDatasetItems from './loadDatasetItems'
import { loadItem, loadItemV2 } from './loadItem'
import { loadItemImageData } from './loadItemImageData'
import { loadItemVideoData } from './loadItemVideoData'
import { loadPresets } from './loadPresets'
import loadStageAnnotations from './loadStageAnnotations'
import { loadTiledImageData } from './loadTiledImageData'
import loadTimeSummary from './loadTimeSummary'
import { loadV2Annotations } from './loadV2Annotations'
import { loadV2AnnotationsSnapshot } from './loadV2AnnotationsSnapshot'
import loadV2TimeSummary from './loadV2TimeSummary'
import { loadV2Workflows } from './loadV2Workflows'
import loadWorkflowActions from './loadWorkflowActions'
import loadWorkflowTemplate from './loadWorkflowTemplate'
import { markConsensusStageInstanceAsReady } from './markConsensusStageInstanceAsReady'
import { refreshAnnotationsVisibility } from './refreshAnnotationsVisibility'
import { rejectStage } from './rejectStage'
import { rejectV2ReviewStage } from './rejectV2ReviewStage'
import reloadDatasetItem from './reloadDatasetItem'
import requestWork from './requestWork'
import resetStageReviewStatus from './resetStageReviewStatus'
import resolveStageForSelectedItem from './resolveStageForSelectedItem'
import { restartV2WorkflowItem } from './restartV2WorkflowItem'
import runInference from './runInference'
import { savePreset } from './savePreset'
import { searchFilenames } from './searchFilenames'
import { searchFilenamesThrottled } from './searchFilenamesThrottled'
import setDatasetItemFilter from './setDatasetItemFilter'
import { setResetZoomMode } from './setResetZoomMode'
import { setStageAutoComplete } from './setStageAutoComplete'
import { setV2AnnotateStageAutoComplete } from './setV2AnnotateStageAutoComplete'
import { setV2SelectedDatasetItem } from './setV2SelectedDatasetItem'
import skipStage from './skipStage'
import { skipV2SelectedStageInstance } from './skipV2SelectedStageInstance'
import { toggleAnnotationsVisibilityByAuthor } from './toggleAnnotationsVisibilityByAuthor'
import { toggleAnnotationsVisibilityByClass } from './toggleAnnotationsVisibilityByClass'
import { transitionFromV2DatasetStage } from './transitionFromV2DatasetStage'
import unskipStage from './unskipStage'
import { updateClassMapping } from './updateClassMapping'
import updateStageAnnotation from './updateStageAnnotation'
import updateStageAnnotationZIndex from './updateStageAnnotationZIndex'
import updateStageParents from './updateStageParents'
import { updateV2Annotation } from './updateV2Annotation'

export const actions: ActionTree<WorkviewState, RootState> = {
  approveStage,
  approveV2ReviewStage,
  archiveStage,
  assignStage,
  assignV2Stage,
  cancelStageAutoComplete,
  cancelV2StageAutoComplete,
  copyStageAnnotations,
  copyV2StageAnnotations,
  createStageAnnotation,
  createV2Annotation,
  createWorkflow,
  deleteAllVisibleStageAnnotations,
  deletePreset,
  deleteStageAnnotation,
  deleteStageAnnotations,
  deleteV2Annotation,
  joinChannel,
  joinV2WorkflowsChannel,
  leaveChannel,
  leaveV2WorkflowsChannel,
  loadAutoAnnotateModels,
  loadCommentThreads,
  loadDataset,
  loadDatasetFolders,
  loadDatasetFoldersThrottled,
  loadDatasetItemCounts,
  loadDatasetItemCountsThrottled,
  loadDatasetItems,
  loadItem,
  loadItemV2,
  loadItemImageData,
  loadItemVideoData,
  loadPresets,
  loadStageAnnotations,
  loadTiledImageData,
  loadTimeSummary,
  loadV2TimeSummary,
  loadV2Annotations,
  loadV2Workflows,
  loadWorkflowActions,
  loadWorkflowTemplate,
  markConsensusStageInstanceAsReady,
  refreshAnnotationsVisibility,
  rejectStage,
  rejectV2ReviewStage,
  reloadDatasetItem,
  requestWork,
  resetStageReviewStatus,
  resolveStageForSelectedItem,
  restartV2WorkflowItem,
  runInference,
  savePreset,
  searchFilenames,
  searchFilenamesThrottled,
  setDatasetItemFilter,
  setResetZoomMode,
  setStageAutoComplete,
  setV2AnnotateStageAutoComplete,
  skipStage,
  skipV2SelectedStageInstance,
  toggleAnnotationsVisibilityByAuthor,
  toggleAnnotationsVisibilityByClass,
  transitionFromV2DatasetStage,
  unskipStage,
  updateClassMapping,
  updateStageAnnotation,
  updateV2Annotation,
  updateStageAnnotationZIndex,
  updateStageParents,
  setV2SelectedDatasetItem,
  loadV2AnnotationsSnapshot
}
