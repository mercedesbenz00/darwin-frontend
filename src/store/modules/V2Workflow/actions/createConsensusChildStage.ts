import { v4 } from 'uuid'

import {
  buildV2WorkflowStagePayload
} from '@/store/modules/V2Workflow/actions/buildV2WorkflowStagePayload'
import { UPDATE_STAGE_CONFIG } from '@/store/modules/V2Workflow/mutations/UPDATE_STAGE_CONFIG'
import { WorkflowAction } from '@/store/modules/V2Workflow/types'
import { StoreMutationPayload } from '@/store/types'
import { StageType } from '@/store/types/StageType'
import {
  StageCoords,
  V2ConsensusStagePayload,
  V2WorkflowStagePayload
} from '@/store/types/V2WorkflowStagePayload'
import { appendNumber } from '@/utils/string'

type StageTypes =
  | StageType.Annotate
  | StageType.Model

export type Payload = {
  consensusId: string
  type: StageTypes
} & StageCoords

/** Balys's ASCII art explains what we are doing here when adding a parallel stage:
 *
 *               ____________________________________________________________________________
 *              |   /---parallel--->"Annotate st"----default---\                 /---fail---|-->
 *"Consensus"-->|--/                                            \---"Test st"---/           |
 *              |  \---parallel--->"Model st"-------default----/                \----pass---|-->
 *              |___________________________________________________________________________|
 */
export const createConsensusChildStage: WorkflowAction<Payload, V2WorkflowStagePayload> = (
  { commit, state },
  { consensusId, type }
) => {
  const childStageId = v4()
  const typeToDefaultNameMap = {
    [StageType.Annotate]: 'Annotate',
    [StageType.Model]: 'Model',
  }

  const consensusStage: V2ConsensusStagePayload | undefined =
    state.editedWorkflow?.stages.find(
      (s): s is V2ConsensusStagePayload => s.id === consensusId
    )
  if (!consensusStage) {
    throw new Error('Consensus stage not found')
  }
  const testStage = state.editedWorkflow?.stages.find(
    s => s.id === consensusStage.config.test_stage_id
  )
  if (!testStage) {
    throw new Error('Consensus\' Test stage not found')
  }

  const childStage = buildV2WorkflowStagePayload({
    id: childStageId,
    type,
    config: {
      x: consensusStage.config.x + 10,
      y: consensusStage.config.y + 10,
    },
    edges: [],
    name: appendNumber(
      typeToDefaultNameMap[type!],
      state.editedWorkflow?.stages.filter(s => s.type === type).map(s => s.name) ?? []
    )
  })

  const payload: StoreMutationPayload<typeof UPDATE_STAGE_CONFIG> = {
    stageId: consensusStage.id,
    config: {
      parallel_stage_ids: [...consensusStage.config.parallel_stage_ids, childStageId]
    }
  }

  if (childStage.type === StageType.Annotate) {
    childStage.assignable_users = []
    childStage.config.assignable_to = 'anyone'
  }

  commit('UPDATE_STAGE_CONFIG', payload)

  commit('CREATE_EDGE', {
    source_stage_id: consensusId,
    target_stage_id: childStageId,
    stageId: consensusId,
    name: 'parallel'
  })

  // order of the next two is important
  commit('CREATE_STAGE', childStage)
  commit('CREATE_EDGE', {
    source_stage_id: childStageId,
    target_stage_id: testStage.id,
    stageId: childStageId,
    name: 'default'
  })
}
