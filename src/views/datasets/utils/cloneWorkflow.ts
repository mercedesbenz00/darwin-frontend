import { cloneDeep } from 'lodash'
import { v4 } from 'uuid'

import {
  DatasetPayload,
  StageType,
  V2WorkflowPayload
} from '@/store/types'

/**
  * Clone a provided workflow and assign to it the provided dataset
  * @param workflow
  * @param datasetId
  * @param workflow name
*/
export const cloneWorkflow = ({
  workflow,
  datasetId,
  workflowName
}: {
  workflow: V2WorkflowPayload
  datasetId: DatasetPayload['id']
  workflowName: string
}): V2WorkflowPayload => {
  const keyMap = new Map<string, string>()
  const newId = (key: string): string => {
    if (!keyMap.has(key)) {
      keyMap.set(key, v4())
    }
    return keyMap.get(key)!
  }

  const newWorkflow = cloneDeep(workflow)

  newWorkflow.id = 'new-workflow'
  newWorkflow.name = workflowName

  newWorkflow.stages = newWorkflow.stages
    .map((s) => {
      // wire the workflow with the dataset
      if (s.type === StageType.Dataset) {
        s.config.dataset_id = datasetId
      }

      // set new ids for edges
      s.id = newId(s.id)
      s.edges = s.edges.map((e) => ({
        ...e,
        id: newId(e.id),
        source_stage_id: newId(e.source_stage_id),
        target_stage_id: newId(e.target_stage_id)
      }))

      // set proper ids for parallel and test stages
      if (s.type === StageType.ConsensusEntrypoint) {
        s.config.parallel_stage_ids = s.config.parallel_stage_ids?.map(
          (id) => newId(id)
        )
        s.config.test_stage_id = newId(s.config.test_stage_id)
      }

      return s
    })
    .filter((s) => s.type !== StageType.Discard)

  return newWorkflow
}
