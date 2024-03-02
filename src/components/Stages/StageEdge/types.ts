import { StageType } from '@/store/types/StageType'
import { V2WorkflowEdgePayload } from '@/store/types/V2WorkflowEdgePayload'
import { StageCoords } from '@/store/types/V2WorkflowStagePayload'

export enum EdgeType {
  IN = 'in',
  OUT = 'out'
}

export type StageEdgeProps = {
  id: string
  edge: V2WorkflowEdgePayload | null
  edgeType: EdgeType
  connectable: boolean
  type: StageType
  currentStagePosition: StageCoords
  name?: string
}

export type MouseClickPosition = {
  mouseX: number
  mouseY: number
}
