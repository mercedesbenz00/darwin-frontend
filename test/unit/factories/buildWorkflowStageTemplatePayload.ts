import { DEFAULT_METADATA } from '@/components/DatasetSettings/utils'
import {
  AnnotateStageTemplatePayload,
  CodeStageTemplatePayload,
  CompleteStageTemplatePayload,
  ModelStageTemplatePayload,
  ReviewStageTemplatePayload,
  StageType,
  TestStageTemplatePayload,
  WorkflowStageTemplatePayload
} from '@/store/types'

type Params = Partial<WorkflowStageTemplatePayload>

const buildBase = (
  params: Omit<Params, 'type' | 'metadata'>
): Omit<WorkflowStageTemplatePayload, 'type' | 'metadata'> => ({
  id: -1,
  name: 'Annotate',
  stage_number: 1,
  workflow_template_id: -1,
  workflow_stage_template_assignees: [],
  ...params
})

export const buildWorkflowStageTemplatePayload =
  (params: Params = { type: StageType.Annotate }): WorkflowStageTemplatePayload => {
    const { type = StageType.Annotate, metadata, ...baseParams } = params
    const base = buildBase(baseParams)
    const payload = { ...base, type, metadata: metadata || DEFAULT_METADATA[type]() }

    if (type === StageType.Annotate) { return payload as AnnotateStageTemplatePayload }
    if (type === StageType.Code) { return payload as CodeStageTemplatePayload }
    if (type === StageType.Complete) { return payload as CompleteStageTemplatePayload }
    if (type === StageType.Model) { return payload as ModelStageTemplatePayload }
    if (type === StageType.Review) { return payload as ReviewStageTemplatePayload }
    if (type === StageType.Test) { return payload as TestStageTemplatePayload }

    throw new Error('Invalid type given')
  }

export const buildAnnotateStageTemplatePayload = (
  params: Omit<Partial<AnnotateStageTemplatePayload>, 'type'>
): AnnotateStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Annotate,
  metadata: DEFAULT_METADATA[StageType.Annotate]() as AnnotateStageTemplatePayload['metadata'],
  ...params
})

export const buildReviewStageTemplatePayload = (
  params: Omit<Partial<ReviewStageTemplatePayload>, 'type'>
): ReviewStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Review,
  metadata: DEFAULT_METADATA[StageType.Review]() as ReviewStageTemplatePayload['metadata'],
  ...params
})

export const buildModelStageTemplatePayload = (
  params: Omit<Partial<ModelStageTemplatePayload>, 'type'>
): ModelStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Model,
  metadata: DEFAULT_METADATA[StageType.Model]() as ModelStageTemplatePayload['metadata'],
  ...params
})

export const buildCodeStageTemplatePayload = (
  params: Omit<Partial<CodeStageTemplatePayload>, 'type'>
): CodeStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Code,
  metadata: DEFAULT_METADATA[StageType.Code]() as CodeStageTemplatePayload['metadata'],
  ...params
})

export const buildCompleteStageTemplatePayload = (
  params: Omit<Partial<CompleteStageTemplatePayload>, 'type'>
): CompleteStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Complete,
  metadata: DEFAULT_METADATA[StageType.Complete]() as CompleteStageTemplatePayload['metadata'],
  ...params
})

export const buildTestStageTemplatePayload = (
  params: Omit<Partial<TestStageTemplatePayload>, 'type'>
): TestStageTemplatePayload => ({
  ...buildBase(params),
  type: StageType.Test,
  metadata: DEFAULT_METADATA[StageType.Test]() as TestStageTemplatePayload['metadata'],
  ...params
})
