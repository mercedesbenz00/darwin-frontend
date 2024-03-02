import { StageType } from '@/store/types/StageType'
import { StageCoords } from '@/store/types/V2WorkflowStagePayload'

export type StageSidebarTemplateProps = {
  type: StageType
}

export type DragEnd = {
  type: StageType
  droppable: boolean
} & StageCoords
