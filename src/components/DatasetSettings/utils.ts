import {
  ArchiveStageTemplatePayload,
  AnnotateStageTemplatePayload,
  CodeStageTemplatePayload,
  CompleteStageTemplatePayload,
  MembershipPayload,
  MembershipScore,
  ModelStageTemplatePayload,
  ReviewStageTemplatePayload,
  StageType,
  TestStageTemplatePayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload,
  WebhookStageTemplatePayload
} from '@/store/types'
import { getFullName } from '@/utils'

const TITLES_MAP: Record<Exclude<StageType, StageType.Dataset | StageType.Discard>, string> = {
  [StageType.Archive]: 'Archive',
  [StageType.Annotate]: 'Annotators',
  [StageType.Test]: 'Automated Tests',
  [StageType.Review]: 'Reviewers',
  [StageType.Complete]: 'Annotators',
  [StageType.ConsensusEntrypoint]: 'Consensus',
  [StageType.ConsensusTest]: 'Consensus',
  [StageType.Logic]: 'Logic',
  [StageType.Model]: 'AI Model',
  [StageType.Code]: 'Transform',
  [StageType.Webhook]: 'Webhook'

}
export const getDefaultStageTemplateName =
  (type: Exclude<StageType, StageType.Dataset | StageType.Discard>): string => TITLES_MAP[type]

export type StageActor = {
  member: MembershipPayload
  scoreInDataset: MembershipScore | null
  scoreInTeam: MembershipScore | null
}

export type AssigneeSamplingRate = StageActor & {
  samplingRate: number
  selected: boolean
}

export const assigneeSamplingRates = (
  stage: AnnotateStageTemplatePayload | ReviewStageTemplatePayload,
  actors: StageActor[]
): AssigneeSamplingRate[] => {
  const { workflow_stage_template_assignees: assignees } = stage
  return actors
    .map(actor => ({
      actor,
      assignee: assignees.find(a => a.assignee_id === actor.member.user_id)
    }))
    .map(({ actor, assignee }) => ({
      ...actor,
      samplingRate: assignee ? assignee.sampling_rate : 1.0,
      selected: !!assignee
    }))
}

export const searchByName = (
  selection: AssigneeSamplingRate[],
  search: string
): AssigneeSamplingRate[] =>
  selection
    .filter(d => getFullName(d.member).match(new RegExp(search, 'ig')))
    .sort((a, b) => getFullName(a.member).localeCompare(getFullName(b.member)))

const DEFAULT_ARCHIVE_METADATA: ArchiveStageTemplatePayload['metadata'] = {}

const DEFAULT_ANNOTATE_METADATA: AnnotateStageTemplatePayload['metadata'] = {
  assignable_to: 'anyone',
  base_sampling_rate: 1,
  user_sampling_rate: 1
}

const DEFAULT_REVIEW_METADATA: ReviewStageTemplatePayload['metadata'] = {
  assignable_to: 'anyone',
  base_sampling_rate: 1,
  user_sampling_rate: 1,
  readonly: false
}

const DEFAULT_TEST_METADATA: TestStageTemplatePayload['metadata'] = {
  type_thresholds: {
    bounding_box: 0.9,
    polygon: 0.9
  }
}

const DEFAULT_COMPLETE_METADATA: CompleteStageTemplatePayload['metadata'] = {}
const DEFAULT_CODE_METADATA: CodeStageTemplatePayload['metadata'] = {}
const DEFAULT_MODEL_METADATA: ModelStageTemplatePayload['metadata'] = { auto_instantiate: true }
const DEFAULT_WEBHOOK_METADATA: WebhookStageTemplatePayload['metadata'] = {}

export const DEFAULT_METADATA:
  Record<
    Exclude<
      StageType,
      StageType.Dataset | StageType.Discard | StageType.Logic |
      StageType.ConsensusEntrypoint | StageType.ConsensusTest
    >,
    () => WorkflowStageTemplatePayload['metadata']
  > = {
    [StageType.Archive]: () => ({ ...DEFAULT_ARCHIVE_METADATA }),
    [StageType.Annotate]: () => ({ ...DEFAULT_ANNOTATE_METADATA }),
    [StageType.Test]: () => ({ ...DEFAULT_TEST_METADATA }),
    [StageType.Review]: () => ({ ...DEFAULT_REVIEW_METADATA }),
    [StageType.Complete]: () => ({ ...DEFAULT_COMPLETE_METADATA }),
    [StageType.Code]: () => ({ ...DEFAULT_CODE_METADATA }),
    [StageType.Model]: () => ({ ...DEFAULT_MODEL_METADATA }),
    [StageType.Webhook]: () => ({ ...DEFAULT_WEBHOOK_METADATA })
  }

export const buildNewStage = (
  template: WorkflowTemplatePayload,
  type: Exclude<
    StageType,
    StageType.Dataset | StageType.Discard | StageType.Logic |
    StageType.ConsensusEntrypoint | StageType.ConsensusTest
  >
): WorkflowStageTemplatePayload => ({
  id: -1,
  name: getDefaultStageTemplateName(type),
  metadata: DEFAULT_METADATA[type](),
  stage_number: template.workflow_stage_templates.length,
  type,
  workflow_stage_template_assignees: [],
  workflow_template_id: template.id
}) as WorkflowStageTemplatePayload

export const isBlindAnnotateStage = (stage: WorkflowStageTemplatePayload): boolean =>
  stage.type === StageType.Annotate && (stage.metadata.parallel || 1) > 1

export const isNormalAnnotateStage = (stage: WorkflowStageTemplatePayload): boolean =>
  stage.type === StageType.Annotate && (stage.metadata.parallel || 1) === 1

export const groupStages = (
  stages: WorkflowStageTemplatePayload[]
): WorkflowStageTemplatePayload[][] => {
  const groups: WorkflowStageTemplatePayload[][] = []

  stages.forEach((stage, index, stages) => {
    if (stage.type === StageType.Test) {
      groups[groups.length - 1].push(stage)
    } else if (stage.type === StageType.Review && stages[index - 1]?.type === StageType.Test) {
      groups[groups.length - 1].push(stage)
    } else if (stage.type !== 'complete') {
      groups.push([stage])
    }
  })

  return groups
}
