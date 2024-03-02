import { 
  DatasetPayload, 
  V2WorkflowPayload, 
  V2WorkflowStagePayload
} from '@/store/types'

export type StageFilterChange = {
  excludedIds: V2WorkflowStagePayload['id'][]
  includedIds: V2WorkflowStagePayload['id'][]
}

export type StageFilterProps = {
  dataset: DatasetPayload
  workflow: V2WorkflowPayload
  excludedIds: V2WorkflowStagePayload['id'][]
  includedIds: V2WorkflowStagePayload['id'][]
  showRouting?: boolean
}
