import {
  DatasetItemPayload,
  V2DatasetItemPayload,
  DatasetImagePayload,
  WorkflowPayload,
  DatasetItemType
} from '@/store/types'
// when used as objects, enums need to be imported directly
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { StageType } from '@/store/types/StageType'

/* eslint-disable camelcase */
export const isImageItem = (
  item: DatasetItemPayload
): item is (DatasetItemPayload & { dataset_image: DatasetImagePayload }) =>
  !!item && !!item.dataset_image
/* eslint-enable camelcase */

export const isImageItemV2 = (
  item: V2DatasetItemPayload
): boolean =>
  !!item?.slot_types.includes(DatasetItemType.image)

export const isDicomItem = (item: DatasetItemPayload): boolean => {
  return !!item.dataset_video &&
    !!item.dataset_video.metadata &&
    item.dataset_video.metadata.type === 'dicom'
}

export const isPdfItem = (item: DatasetItemPayload): boolean => {
  return !!item.dataset_video &&
    !!item.dataset_video.metadata &&
    item.dataset_video.metadata.type === 'pdf'
}

export const STAGE_TYPE_TO_ITEM_STATUS: Record<StageType, DatasetItemStatus> = {
  [StageType.Archive]: DatasetItemStatus.archive,
  [StageType.Annotate]: DatasetItemStatus.annotate,
  [StageType.Review]: DatasetItemStatus.review,
  [StageType.Complete]: DatasetItemStatus.complete,
  [StageType.ConsensusEntrypoint]: DatasetItemStatus.annotate,
  [StageType.ConsensusTest]: DatasetItemStatus.annotate,
  [StageType.Logic]: DatasetItemStatus.logic,
  [StageType.Dataset]: DatasetItemStatus.new,
  [StageType.Discard]: DatasetItemStatus.archived,
  [StageType.Model]: DatasetItemStatus.annotate,
  [StageType.Code]: DatasetItemStatus.annotate,
  [StageType.Test]: DatasetItemStatus.annotate,
  [StageType.Webhook]: DatasetItemStatus.annotate
}

export const STAGE_TYPE_TO_WORKFLOW_STATUS: Record<StageType, WorkflowPayload['status']> = {
  [StageType.Archive]: DatasetItemStatus.archive,
  [StageType.Annotate]: DatasetItemStatus.annotate,
  [StageType.Code]: DatasetItemStatus.annotate,
  [StageType.Complete]: DatasetItemStatus.complete,
  [StageType.Logic]: DatasetItemStatus.logic,

  // These two are just for object completeness and should be encountered
  [StageType.Dataset]: DatasetItemStatus.annotate,
  [StageType.Discard]: DatasetItemStatus.complete,

  [StageType.ConsensusEntrypoint]: DatasetItemStatus.annotate,
  [StageType.ConsensusTest]: DatasetItemStatus.annotate,
  [StageType.Model]: DatasetItemStatus.annotate,
  [StageType.Review]: DatasetItemStatus.review,
  [StageType.Test]: DatasetItemStatus.annotate,
  [StageType.Webhook]: DatasetItemStatus.annotate
}
