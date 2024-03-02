import {
  V2WorkflowStageInstancePayload,
  V2WorkflowStagePayload,
  DatasetItemStatus
} from '@/store/types'

export type AssignmentDropdownProps = {
  status: DatasetItemStatus
}

export type StagesProps = {
  maxWidth: number
}

export type StageData = {
  stage: V2WorkflowStagePayload
  instance: V2WorkflowStageInstancePayload | null
  key: string,
  followers?: StageData[]
}

export type StageProps = {
  data: StageData,
  active?: boolean
  selected?: boolean
}
