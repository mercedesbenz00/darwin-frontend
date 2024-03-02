import {
  AnnotateStagePayload,
  CodeStagePayload,
  CompleteStagePayload,
  DatasetImagePayload,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetItemType,
  ImagePayload,
  ModelStagePayload,
  ReviewStagePayload,
  StageType,
  WorkflowStagePayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload
} from '@/store/types'

import TutorialError from './TutorialError'
import { dataset } from './data/dataset'

const itemId = (datasetImageId: number) => datasetImageId * 10
const workflowId = (datasetImageId: number) => datasetImageId * 100

const stageId = (datasetImageId: number, stageNumber: number) =>
  workflowId(datasetImageId) + stageNumber

const initializeDatasetImage = (image: ImagePayload): DatasetImagePayload => ({
  dataset_id: dataset.id,
  dataset_video_id: null,
  id: image.id * 10,
  image,
  seq: image.id,
  set: 1
})

const initializeItem = (datasetImage: DatasetImagePayload): DatasetItemPayload => ({
  archived_reason: null,
  archived: false,
  current_workflow: null,
  current_workflow_id: null,
  dataset_id: datasetImage.dataset_id,
  dataset_image_id: datasetImage.id,
  dataset_image: datasetImage,
  dataset_video_id: null,
  dataset_video: null,
  file_size: 0,
  filename: datasetImage.image.original_filename,
  height: datasetImage.image.height,
  id: itemId(datasetImage.id),
  inserted_at: '2020-06-12T00:00:00',
  labels: [],
  path: '/',
  priority: 0,
  seq: datasetImage.seq,
  set: datasetImage.set,
  status: DatasetItemStatus.annotate,
  updated_at: '2020-06-12T00:00:00',
  width: datasetImage.image.width,
  type: DatasetItemType.image
})

const initializeStage = (
  datasetImage: DatasetImagePayload,
  stageTemplate: WorkflowStageTemplatePayload
): WorkflowStagePayload => {
  const { type } = stageTemplate
  const payload = {
    assignee_id: null,
    completed: false,
    completes_at: null,
    dataset_item_id: itemId(datasetImage.id),
    id: stageId(datasetImage.id, stageTemplate.stage_number),
    metadata: {},
    number: stageTemplate.stage_number,
    skipped_reason: null,
    skipped: false,
    template_metadata: stageTemplate.metadata,
    type: stageTemplate.type,
    workflow_id: workflowId(datasetImage.id),
    workflow_stage_template_id: stageTemplate.id
  }

  if (type === StageType.Annotate) { return payload as AnnotateStagePayload }
  if (type === StageType.Code) { return payload as CodeStagePayload }
  if (type === StageType.Complete) { return payload as CompleteStagePayload }
  if (type === StageType.Model) { return payload as ModelStagePayload }
  if (type === StageType.Review) { return payload as ReviewStagePayload }

  throw new Error('Invalid type given')
}

const initializeWorkflow = (
  datasetImage: DatasetImagePayload,
  workflowTemplate: WorkflowTemplatePayload,
  currentStage: number
): Pick<DatasetItemPayload, 'current_workflow' | 'current_workflow_id'> => {
  const annotateTemplate =
    workflowTemplate.workflow_stage_templates.find(t => t.type === StageType.Annotate)

  const reviewTemplate =
    workflowTemplate.workflow_stage_templates.find(t => t.type === StageType.Review)

  const completeTemplate =
    workflowTemplate.workflow_stage_templates.find(t => t.type === StageType.Complete)

  if (!annotateTemplate || !reviewTemplate || !completeTemplate) {
    throw new TutorialError('Initializing workflow using invalid template ')
  }

  const id = workflowId(datasetImage.id)

  const workflow: DatasetItemPayload['current_workflow'] = {
    dataset_item_id: itemId(datasetImage.id),
    id,
    workflow_template_id: workflowTemplate.id,
    current_stage_number: currentStage,
    current_workflow_stage_template_id: annotateTemplate.id,
    status: DatasetItemStatus.annotate,
    stages: {
      1: [initializeStage(datasetImage, annotateTemplate)],
      2: [initializeStage(datasetImage, reviewTemplate)],
      3: [initializeStage(datasetImage, completeTemplate)]
    }
  }

  return { current_workflow: workflow, current_workflow_id: id }
}

export const createItem = (
  image: ImagePayload,
  workflowTeplate: WorkflowTemplatePayload,
  stageNumber: number = 1
): DatasetItemPayload => {
  const datasetImage = initializeDatasetImage(image)
  return {
    ...initializeItem(datasetImage),
    ...initializeWorkflow(datasetImage, workflowTeplate, stageNumber)
  }
}
