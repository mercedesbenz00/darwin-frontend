import { GetterTree } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { RootState } from '@/store/types'

import { autoAnnotationTypedModels } from './autoAnnotationTypedModels'
import { currentLoadedVideo } from './currentLoadedVideo'
import { currentStageInstancesForItem } from './currentStageInstancesForItem'
import { defaultWorkflowTemplate } from './defaultWorkflowTemplate'
import { isStageInstanceCurrent } from './isStageInstanceCurrent'
import { nextDatasetItem } from './nextDatasetItem'
import { nonTagAnnotationClasses } from './nonTagAnnotationClasses'
import { nonTagSortedAnnotationsByStage } from './nonTagSortedAnnotationsByStage'
import { selectedAnnotation } from './selectedAnnotation'
import { selectedStageActiveActorStats } from './selectedStageActiveActorStats'
import { selectedStageActiveClassStats } from './selectedStageActiveClassStats'
import { selectedStageInstanceAssignee } from './selectedStageInstanceAssignee'
import { selectedStageNonTagAnnotations } from './selectedStageNonTagAnnotations'
import { sortedAnnotationsByStage } from './sortedAnnotationsByStage'
import { sortedInferredAnnotationsByStage } from './sortedInferredAnnotationsByStage'
import { stageCurrentAction } from './stageCurrentAction'
import { stageInstanceAssignee } from './stageInstanceAssignee'
import { stageInstanceTimeState } from './stageInstanceTimeState'
import { stagePreviousStages } from './stagePreviousStages'
import { v2DatasetItems } from './v2DatasetItems'
import { v2SelectedDatasetItem } from './v2SelectedDatasetItem'
import { v2StageCurrentAction } from './v2StageCurrentAction'

export const getters: GetterTree<WorkviewState, RootState> = {
  autoAnnotationTypedModels,
  currentLoadedVideo,
  currentStageInstancesForItem,
  defaultWorkflowTemplate,
  isStageInstanceCurrent,
  nextDatasetItem,
  nonTagAnnotationClasses,
  nonTagSortedAnnotationsByStage,
  selectedAnnotation,
  selectedStageActiveActorStats,
  selectedStageActiveClassStats,
  selectedStageNonTagAnnotations,
  selectedStageInstanceAssignee,
  sortedAnnotationsByStage,
  sortedInferredAnnotationsByStage,
  stageCurrentAction,
  stageInstanceAssignee,
  stageInstanceTimeState,
  stagePreviousStages,
  v2StageCurrentAction,
  v2SelectedDatasetItem,
  v2DatasetItems
}
