import { StageActionType, DatasetItemStatus, StageType } from '@/store/types'

/**
 * Defines which status class (for styling) the button will have for each possible action.
 *
 * Statuses are styled in the fashion of item statuses,
 * with the addition of the special `rejected` status, which uses the rejection icon.
 */
export const StageActionTypeToStatus: Record<
  StageActionType,
  DatasetItemStatus | StageType | 'rejected'
> = {
  [StageActionType.Archive]: DatasetItemStatus.archived,
  [StageActionType.Archived]: DatasetItemStatus.archived,
  [StageActionType.Completed]: DatasetItemStatus.complete,
  [StageActionType.MarkAsComplete]: DatasetItemStatus.complete,
  [StageActionType.New]: DatasetItemStatus.new,
  [StageActionType.SendBack]: 'rejected',
  [StageActionType.SendToArchive]: DatasetItemStatus.archive,
  [StageActionType.SendToAnnotate]: DatasetItemStatus.annotate,
  // those two are just for compatibility, they should not be encountered in V1
  [StageActionType.SendToConsensus]: DatasetItemStatus.consensus_entrypoint,
  [StageActionType.SendToLogic]: DatasetItemStatus.logic,

  [StageActionType.SendToCode]: StageType.Code,
  [StageActionType.SendToModel]: StageType.Model,
  [StageActionType.SendToNextReview]: DatasetItemStatus.review,
  [StageActionType.SendToReview]: DatasetItemStatus.review,
  [StageActionType.SendToTest]: DatasetItemStatus.annotate,
  [StageActionType.Skip]: DatasetItemStatus.review,
  [StageActionType.SendToWebhook]: DatasetItemStatus.webhook
}
