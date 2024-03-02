import { Store } from 'vuex'

import { addCommentThreadAction } from '@/engine/actions'
import { EditorError } from '@/engine/editor'
import { AnnotationTypeSerializer } from '@/engine/managers/serializerManager'
import { IView } from '@/engine/models/views/types'
import { initializeCommentThread } from '@/engine/utils'
import { CommentBoundingBox, CommentVertices } from '@/engineCommon/comment'
import { EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import {
  CommentThread,
  isCommentVertices,
  RootState
} from '@/store/types'
export class CommentManager {
  public _commentThreads: CommentThread[] = []

  private view: IView

  constructor (view: IView) {
    this.view = view
  }

  get store (): Store<RootState> {
    return this.view.store
  }

  get selectedCommentThread (): CommentThread | undefined {
    return this._commentThreads.find(c => c.isSelected)
  }

  get commentThreads (): CommentThread[] {
    return this._commentThreads.filter(comment => {
      // For videos, we need to filter by comment frame index
      if (this.view.loadedVideo) {
        if (typeof comment.frameIndex !== 'number') { return false }
        return this.view.isFrameIndexRelatedToView(comment.frameIndex)
      }

      // For any other type, we just return all the comments
      return true
    })
  }

  createCommentThread (box: CommentVertices): void | Promise<void> {
    const { currentItem, loadedVideo } = this.view
    // silently ignore request if no item
    if (!currentItem) { return }

    const authorId = this.store.state.user.profile ? this.store.state.user.profile.id : -1
    const boundingBox = this.commentBoxToBoundingBox(box)

    const commentThread = loadedVideo
      ? initializeCommentThread(authorId, box, boundingBox, this.view.currentFrameIndex)
      : initializeCommentThread(authorId, box, boundingBox)
    return this.view.actionManager.do(addCommentThreadAction(this.view.editor, commentThread))
  }

  findTopCommentThreadAt (point: ImagePoint): CommentThread | undefined {
    const renderer = this.view.renderManager.rendererFor('commentator')
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const loadedVideo = this.view.loadedVideo

    return this._commentThreads.find(commentThread => {
      if (loadedVideo && this.view.currentFrameIndex !== commentThread.frameIndex) {
        return false
      }
      if (commentThread.isSelected) {
        const { path } = renderer.getPath(commentThread, this.view)
        return this.view.isPointInPath(point, path)
      }

      const centroidRectPath = (
        renderer.supportsCentroidRectPath &&
        renderer.getCentroidRectPath(commentThread)
      )

      return (
        commentThread.annotationBoundingBox &&
        centroidRectPath &&
        this.view.isPointInPath(point, centroidRectPath)
      )
    })
  }

  findCommentThreadVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | undefined {
    const renderer = this.view.renderManager.rendererFor('commentator')
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const paths: EditableImagePoint[][] = this._commentThreads
      .filter(commentThread => commentThread.isSelected && commentThread.isEditable)
      .map(commentThread => renderer.getAllVertices(commentThread, this.view))

    return this.view.findVertexAtPath(paths, point, threshold)
  }

  selectCommentThread (commentThread: CommentThread): void {
    if (commentThread.isSelected) { return }
    this.store.commit('comment/SELECT_COMMENT_THREAD', commentThread)
  }

  deselectAllCommentThreads (): void {
    this.store.commit('comment/DESELECT_ALL_COMMENT_THREADS')
    this.store.commit('comment/REMOVE_UNSAVED_THREAD')
  }

  deselectAllCommentThreadVertices (): void {
    const renderer = this.view.renderManager.rendererFor('commentator')
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const paths: EditableImagePoint[][] = this._commentThreads
      .map(commentThread => renderer.getAllVertices(commentThread, this.view))

    this.view.deselectAllVerticesInPath(paths)
  }

  highlightCommentThread (commentThread: CommentThread): void {
    if (commentThread.isHighlighted) { return }
    this.store.commit('comment/FOCUS_COMMENT_THREAD', commentThread)
  }

  unhighlightAllCommentThreads (): void {
    if (this._commentThreads.every(t => !t.isHighlighted)) { return }
    this.store.commit('comment/UNFOCUS_ALL_COMMENT_THREADS')
  }

  unhighlightAllCommentThreadVertices (): void {
    const renderer = this.view.renderManager.rendererFor('commentator')
    if (!renderer || !('getAllVertices' in renderer)) { return }

    const paths: EditableImagePoint[][] = this._commentThreads
      .filter(commentThread => commentThread.isSelected)
      .map(commentThread => renderer.getAllVertices(commentThread, this.view))

    this.view.unhighlightAllVerticesInPath(paths)
  }

  setCommentThreadMoving (commentThread: CommentThread): void {
    if (commentThread.isMoving) { return }
    this.store.commit('comment/SET_MOVING_COMMENT_THREAD', commentThread)
  }

  addNewCommentThread (commentThread: CommentThread): Promise<unknown> {
    return this.store.dispatch('comment/addUnsavedCommentThread', commentThread)
  }

  updateCommentThread (commentThread: CommentThread): Promise<unknown> {
    return this.store.dispatch('comment/updateCommentThread', {
      ...commentThread,
      boundingBox: this.commentBoxToBoundingBox(commentThread.annotationBoundingBox)
    })
  }

  removeCommentThread (commentThread: CommentThread): Promise<unknown> {
    return this.store.dispatch('comment/removeCommentThread', commentThread)
  }

  get storeCommentThreads (): CommentThread[] {
    return this.store.state.comment.commentThreads.filter(t => !t.resolved)
  }

  public setCommentThreads (): void {
    const storeThreads = this.store.state.comment.commentThreads.filter(t => !t.resolved)

    const serializer = this.view.editor.serializerManager.getSerializer('commentator')

    if (!serializer) {
      return console.warn("Couldn't load comments into editor. Plugin not ready.")
    }

    this._commentThreads = storeThreads
      .map(t => ({
        ...t,
        annotationBoundingBox: this.commentBoundingBoxToBox(serializer, t.boundingBox)
      }))

    // Redefine Views comment threads items
    this.view.setCommentThreads()

    this.view.annotationsLayer.changed()
  }

  private commentBoxToBoundingBox (data: CommentVertices): CommentBoundingBox {
    const serializer = this.view.editor.serializerManager.getSerializer('commentator')
    if (!serializer) { throw new EditorError('Commentator plugin not loaded.') }

    return serializer.serialize(data)
  }

  private commentBoundingBoxToBox (
    serializer: AnnotationTypeSerializer,
    data: CommentBoundingBox
  ): CommentVertices {
    const box = serializer.deserialize(data)
    if (!box || !isCommentVertices(box)) {
      throw new EditorError('Invalid comment bounding box data')
    }
    return box
  }
}
