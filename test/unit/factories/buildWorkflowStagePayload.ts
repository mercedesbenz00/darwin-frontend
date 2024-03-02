import { DEFAULT_METADATA } from '@/components/DatasetSettings/utils'
import {
  AnnotateStagePayload,
  CodeStagePayload,
  CompleteStagePayload,
  ModelStagePayload,
  ReviewStagePayload,
  StageType,
  TestStagePayload,
  WorkflowStagePayload
} from '@/store/types'

type Params = Partial<WorkflowStagePayload>

const buildBase = (
  params: Omit<Params, 'type' | 'template_metadata'>
): Omit<WorkflowStagePayload, 'type' | 'template_metadata'> => ({
  assignee_id: -1,
  completed: false,
  completes_at: null,
  dataset_item_id: -1,
  id: -1,
  metadata: {},
  number: 1,
  skipped_reason: null,
  skipped: false,
  workflow_id: -1,
  workflow_stage_template_id: -1,
  ...params
})

export const buildWorkflowStagePayload =
  (params: Params = { type: StageType.Annotate }): WorkflowStagePayload => {
    const {
      type = StageType.Annotate,
      template_metadata: templateMetadata,
      ...baseParams
    } = params
    const base = buildBase(baseParams)
    const payload = {
      ...base,
      type,
      template_metadata: templateMetadata || DEFAULT_METADATA[type]()
    }

    if (type === StageType.Annotate) { return payload as AnnotateStagePayload }
    if (type === StageType.Code) { return payload as CodeStagePayload }
    if (type === StageType.Complete) { return payload as CompleteStagePayload }
    if (type === StageType.Model) { return payload as ModelStagePayload }
    if (type === StageType.Review) { return payload as ReviewStagePayload }
    if (type === StageType.Test) { return payload as TestStagePayload }

    throw new Error('Invalid type given')
  }

export const buildAnnotateStagePayload = (
  params: Omit<Partial<AnnotateStagePayload>, 'type'>
): AnnotateStagePayload => ({
  ...buildBase(params),
  type: StageType.Annotate,
  template_metadata:
    DEFAULT_METADATA[StageType.Annotate]() as AnnotateStagePayload['template_metadata'],
  ...params
})

export const buildReviewStagePayload = (
  params: Omit<Partial<ReviewStagePayload>, 'type'>
): ReviewStagePayload => ({
  ...buildBase(params),
  type: StageType.Review,
  template_metadata:
    DEFAULT_METADATA[StageType.Review]() as ReviewStagePayload['template_metadata'],
  ...params
})

export const buildModelStagePayload = (
  params: Omit<Partial<ModelStagePayload>, 'type'>
): ModelStagePayload => ({
  ...buildBase(params),
  type: StageType.Model,
  template_metadata:
    DEFAULT_METADATA[StageType.Model]() as ModelStagePayload['template_metadata'],
  ...params
})

export const buildCodeStagePayload = (
  params: Omit<Partial<CodeStagePayload>, 'type'>
): CodeStagePayload => ({
  ...buildBase(params),
  type: StageType.Code,
  template_metadata:
    DEFAULT_METADATA[StageType.Code]() as CodeStagePayload['template_metadata'],
  ...params
})

export const buildCompleteStagePayload = (
  params: Omit<Partial<CompleteStagePayload>, 'type'>
): CompleteStagePayload => ({
  ...buildBase(params),
  type: StageType.Complete,
  template_metadata:
    DEFAULT_METADATA[StageType.Complete]() as CompleteStagePayload['template_metadata'],
  ...params
})

export const buildTestStagePayload = (
  params: Omit<Partial<TestStagePayload>, 'type'>
): TestStagePayload => ({
  ...buildBase(params),
  type: StageType.Test,
  template_metadata:
    DEFAULT_METADATA[StageType.Test]() as TestStagePayload['template_metadata'],
  ...params
})
