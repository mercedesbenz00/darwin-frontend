import { initializeCommentThread } from '@/engine/utils'
import { CommentBoundingBox, CommentVertices } from '@/engineCommon/comment'
import { EditablePoint } from '@/engineCommon/point'

const annotationBoundingBox: CommentVertices = {
  topLeft: new EditablePoint<'Image'>({ x: 0, y: 0 }),
  topRight: new EditablePoint<'Image'>({ x: 100, y: 0 }),
  bottomRight: new EditablePoint<'Image'>({ x: 100, y: 100 }),
  bottomLeft: new EditablePoint<'Image'>({ x: 0, y: 100 })
}
const boundingBox: CommentBoundingBox = { x: 0, y: 0, w: 100, h: 100 }

it('initializes a new, unsaved image comment thread', () => {
  const commentThread = initializeCommentThread(1, annotationBoundingBox, boundingBox)
  expect(commentThread).toEqual({
    annotationBoundingBox,
    authorId: 1,
    boundingBox,
    commentCount: 0,
    id: -1,
    isEditable: true,
    isHighlighted: false,
    isMoving: false,
    isSelected: true,
    comments: [],
    workflowId: -1
  })
})

it('initializes a new, unsaved video comment thread', () => {
  const commentThread = initializeCommentThread(1, annotationBoundingBox, boundingBox, 2)
  expect(commentThread).toEqual({
    annotationBoundingBox,
    authorId: 1,
    boundingBox,
    frameIndex: 2,
    commentCount: 0,
    id: -1,
    isEditable: true,
    isHighlighted: false,
    isMoving: false,
    isSelected: true,
    comments: [],
    workflowId: -1
  })
})
