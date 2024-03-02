import { EditableImagePoint } from '@/engineCommon/point'

export type UpdateAnnotationContext = {
  action: 'update'
  content: [EditableImagePoint[][], number]
}

export type DeleteVertexContext = {
  action: 'deleteVertex'
  content: [EditableImagePoint[], number]
}

export type DeletableVertexContext = DeleteVertexContext | UpdateAnnotationContext | null

export class EditPluginError extends Error {
  constructor (message: string) {
    super(`Edit Plugin: ${message}`)
  }
}
