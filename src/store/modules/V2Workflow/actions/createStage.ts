import { v4 } from 'uuid'

import {
  buildV2WorkflowStagePayload
} from '@/store/modules/V2Workflow/actions/buildV2WorkflowStagePayload'
import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { StageType } from '@/store/types/StageType'
import { StageCoords, V2WorkflowStagePayload } from '@/store/types/V2WorkflowStagePayload'
import { appendNumber } from '@/utils/string'

type StageTypes =
  | StageType.Review
  | StageType.Annotate
  | StageType.Discard
  | StageType.Complete
  | StageType.Model
  | undefined

export type Payload = {
  type: StageTypes
} & StageCoords

export const createStage: WorkflowAction<Payload, V2WorkflowStagePayload> = (
  { commit, state },
  { type, x, y }
) => {
  const uuid = v4()
  const typeToDefaultNameMap = {
    [StageType.Annotate]: 'Annotate',
    [StageType.Archive]: 'Archive',
    [StageType.Review]: 'Review',
    [StageType.Complete]: 'Complete',
    [StageType.ConsensusEntrypoint]: 'Consensus',
    [StageType.Discard]: 'Discard',
    [StageType.Model]: 'AI Model',
    [StageType.Dataset]: 'Dataset',
    [StageType.Webhook]: 'Webhook'
  }

  const stage = buildV2WorkflowStagePayload({
    id: uuid,
    type,
    config: {
      x,
      y
    },
    name: appendNumber(
      typeToDefaultNameMap[type!],
      state.editedWorkflow?.stages.filter(s => s.type === type).map(s => s.name) ?? []
    )
  })

  if (stage.type === StageType.ConsensusEntrypoint) {
    const consensusStage = stage
    const testStage = buildV2WorkflowStagePayload({
      id: consensusStage.config.test_stage_id,
      type: StageType.ConsensusTest,
      config: {
        x: consensusStage.config.x,
        y: consensusStage.config.y
      },
      name: `${ consensusStage.name } - test`
    })

    commit('CREATE_CONSENSUS_STAGE', [consensusStage, testStage])
    return
  }

  commit('CREATE_STAGE', stage)
}
