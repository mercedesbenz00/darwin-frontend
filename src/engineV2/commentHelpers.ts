import { v4 as uuidv4 } from 'uuid'

import { verticesToBoundingBox, boundingBoxToVertices } from '@/engineCommon/comment'
import { EditableImagePoint, EditablePoint } from '@/engineCommon/point'
import { V2CommentThreadPayload } from '@/store/types'

export type EditorCommentThread = {
  authorId: number
  sectionIndex: number | null
  topLeft: EditableImagePoint
  topRight: EditableImagePoint
  bottomLeft: EditableImagePoint
  bottomRight: EditableImagePoint
  id: string
  slotName: string
  conflict?: boolean
}

export const initializeThread = (
  x: number,
  y: number,
  w: number,
  h: number,
  sectionIndex: number,
  slotName: string,
  authorId: number
): EditorCommentThread => ({
  id: uuidv4(),
  authorId,
  topLeft: new EditablePoint<'Image'>({ x, y }),
  topRight: new EditablePoint<'Image'>({ x: x + w, y }),
  bottomLeft: new EditablePoint<'Image'>({ x, y: y + h }),
  bottomRight: new EditablePoint<'Image'>({ x: x + w, y: y + h }),
  slotName,
  sectionIndex
})

export const payloadToEditorThread = (payload: V2CommentThreadPayload): EditorCommentThread => {
  const { x, y, w, h } = payload.bounding_box
  const { author_id: authorId, slot_name: slotName, id, section_index: sectionIndex } = payload
  const { topLeft, topRight, bottomLeft, bottomRight } = boundingBoxToVertices({ x, y, w, h })
  const conflict = !!payload.issue_types?.length

  return {
    authorId,
    bottomLeft,
    bottomRight,
    sectionIndex,
    id,
    slotName,
    topLeft,
    topRight,
    conflict
  }
}

export const getBoundingBox =
  (thread: EditorCommentThread): { x: number, y: number, w: number, h: number } => {
    const { topLeft, topRight, bottomLeft, bottomRight } = thread
    return verticesToBoundingBox({ topLeft, topRight, bottomLeft, bottomRight })
  }
