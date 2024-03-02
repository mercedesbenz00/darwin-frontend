import { EventEmitter } from 'events'

import { EditableImagePoint, ImagePoint, IPoint } from '@/engineCommon/point'
import { EditorCommentThread, initializeThread } from '@/engineV2/commentHelpers'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { CommentatorRenderer } from '@/engineV2/plugins/commentator/CommentatorRenderer'
import { View } from '@/engineV2/views'
import { V2CommentThreadPayload } from '@/store/types/V2CommentThreadPayload' 

enum Events {
  THREAD_CREATED = 'thread:created',
  THREAD_OPENED = 'thread:opened',
  THREAD_CLOSED = 'thread:closed',
  THREAD_UPDATED = 'thread:updated',
  THREAD_UPDATING = 'thread:updating',
  THREADS_CHANGED = 'threads:changed',
  THREAD_SELECTED = 'thread:selected',
  THREAD_DESELECTED = 'thread:deselected'
}

/**
 * Manages comments in the workview.
 *
 * Comments render into a layer separate from annotations adn the thing the
 * editor is actually in charge of here is just the placement, moving and
 * resizing of the bounding box.
 *
 * Everything else is handled by the parent application
 *
 * All changes of the comment threads for the current view + section should go
 * through here, including all changes done by the comment tool.
 *
 * @event thread:created
 * Thread has been created
 * @event thread:updating
 * Thread is being changed in a way that triggers rerender, but it's not final yet.
 * This means we may want to update local data, but don't want to save it.
 * We also want to be fast with the update as the render needs to be fast
 * @event thread:updated
 * Thread has fully updated and now needs to change.
 * @event threads:changed
 * All threads have changed and need to re-render
 */
export class CommentManager extends EventEmitter {
  private view: View

  static THREAD_CREATED = Events.THREAD_CREATED
  static THREAD_OPENED = Events.THREAD_OPENED
  static THREAD_CLOSED = Events.THREAD_CLOSED
  static THREAD_UPDATING = Events.THREAD_UPDATING
  static THREAD_UPDATED = Events.THREAD_UPDATED
  static THREADS_CHANGED = Events.THREADS_CHANGED
  static THREAD_SELECTED = Events.THREAD_SELECTED
  static THREAD_DESELECTED = Events.THREAD_DESELECTED

  public readonly currentUserId: number | null

  constructor (view: View) {
    super()
    this.view = view
    this.currentUserId = view.store.state.user.profile?.id || null
  }

  private threadsById: Partial<{ [id: string]: EditorCommentThread }> = {}

  get threads (): EditorCommentThread[] {
    return Object.values(this.threadsById).filter((t): t is EditorCommentThread => !!t)
  }

  get frameThreads (): EditorCommentThread[] {
    return this.threads
      .filter(t => t.sectionIndex === this.view.currentFrameIndex)
  }

  private _pushThread (payload: EditorCommentThread): void {
    if (this.threadsById[payload.id]) { return }
    this.threadsById[payload.id] = payload
  }

  private _removeThread (payload: EditorCommentThread): void {
    delete this.threadsById[payload.id]
  }

  // add/remove/set

  public addCommentThread (thread: EditorCommentThread): void {
    this._pushThread(thread)
  }

  public removeCommentThread (thread: EditorCommentThread): void {
    this._removeThread(thread)
  }

  public setCommentThreads (threads: EditorCommentThread[]): void {
    this.threadsById = {}

    threads.forEach(thread => this._pushThread(thread))
    this.emit(Events.THREADS_CHANGED, this.threads)
  }

  // CRUD create

  public initializeNewThread (x: number, y: number, w: number, h: number): EditorCommentThread {
    if (this.currentUserId === null) {
      throw new Error('Cannot create comments without an account')
    }
    const thread =
      initializeThread(
        x,
        y,
        w,
        h,
        this.view.currentFrameIndex,
        this.view.fileManager.slotName,
        this.currentUserId
      )

    this._pushThread(thread)
    this.emit(Events.THREAD_CREATED, thread)

    return thread
  }

  public updateThread (thread: EditorCommentThread): EditorCommentThread | null {
    if (this.threadsById[thread.id]) {
      this.emit(Events.THREAD_UPDATED, thread)
    } else {
      this._pushThread(thread)
      this.emit(Events.THREAD_CREATED, thread)
    }

    this.emit(Events.THREADS_CHANGED, this.threads)

    return thread
  }

  // selection

  selectedThreadId: string | null = null

  // TODO: TMP mock for selectedThread
  public get selectedThread (): V2CommentThreadPayload | null {
    if (!this.selectedThreadId) { return null }

    // TODO: return this.threadsById[this.selectedThreadId] || null
    return null
  }

  public selectCommentThread (thread: EditorCommentThread): void {
    if (!this.threadsById[thread.id]) { return }
    this.selectedThreadId = thread.id
  }

  public deselectCommentThread (): void {
    this.selectedThreadId = null
  }

  public get selectedCommentThread (): EditorCommentThread | null {
    if (!this.selectedThreadId) { return null }
    return this.threadsById[this.selectedThreadId] || null
  }

  // open-close

  openSelectedThread (): void {
    this.emit(Events.THREAD_OPENED, this.selectedThreadId)
  }

  closeSelectedThread (): void {
    this.emit(Events.THREAD_CLOSED)
  }

  // highglithing

  private highlightedCommentThreadId: string | null = null

  public highlightCommentThread (thread: EditorCommentThread): void {
    if (!this.threadsById[thread.id]) { return }
    this.highlightedCommentThreadId = thread.id
    // it's slows down V2 layer dramatically.
    // needs further development.
    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit(Events.THREADS_CHANGED, this.threads)
    }
  }

  public unhighlightCommentThread (): void {
    this.highlightedCommentThreadId = null
    // it's slows down V2 layer dramatically.
    // needs further development.
    if (FeatureFlagsManager.isOffLayerV2) {
      this.emit(Events.THREADS_CHANGED, this.threads)
    }
  }

  public get highlightedCommentThread (): EditorCommentThread | null {
    if (!this.highlightedCommentThreadId) { return null }
    return this.threadsById[this.highlightedCommentThreadId] || null
  }

  public get hihglightedCommentThreadIsEditable (): boolean {
    if (!this.highlightedCommentThread) { return false }
    return this.highlightedCommentThread.authorId === this.currentUserId
  }

  // detection

  public findCommentThreadVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | null {
    const thread = this.selectedCommentThread
    if (!thread) { return null }
    const path = [thread.topLeft, thread.topRight, thread.bottomRight, thread.bottomLeft]
    return this.view.findVertexAtPath([path], point, threshold) || null
  }

  public findTopCommentThreadAt (point: ImagePoint): EditorCommentThread | null {
    const matched = this.threads.find(thread => {
      if (thread.sectionIndex !== null && this.view.currentFrameIndex !== thread.sectionIndex) {
        return false
      }

      const path = [thread.topLeft, thread.topRight, thread.bottomRight, thread.bottomLeft]
      if (thread.id === this.selectedThreadId) {
        return this.view.isPointInPath(point, path)
      }

      const renderer = this.view.renderManager.rendererFor('commentator') as CommentatorRenderer
      if (!renderer) { return null }

      const centroidRectPath = renderer.getCentroidRectPath(thread)

      return this.view.isPointInPath(point, thread.conflict ? path : centroidRectPath)
    })

    return matched || null
  }

  public moveBox (thread: EditorCommentThread, offset: IPoint): void {
    if (!this.threadsById[thread.id]) { return }

    thread.topLeft.x += offset.x
    thread.topLeft.y += offset.y
    thread.topRight.x += offset.x
    thread.topRight.y += offset.y
    thread.bottomLeft.x += offset.x
    thread.bottomLeft.y += offset.y
    thread.bottomRight.x += offset.x
    thread.bottomRight.y += offset.y

    this.emit(Events.THREAD_UPDATING, thread)
  }

  public moveVertex (thread: EditorCommentThread, vertex: ImagePoint, position: IPoint): void {
    // we move the vertex,
    // since it needs to be an orthogonal bounding box, we also move
    // neighboring vertices that are affected

    if (thread.topLeft.x === vertex.x && thread.topLeft.y === vertex.y) {
      thread.topLeft.x = position.x
      thread.topLeft.y = position.y

      thread.bottomLeft.x = position.x
      thread.topRight.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
      return
    } if (thread.topRight.x === vertex.x && thread.topRight.y === vertex.y) {
      thread.topRight.x = position.x
      thread.topRight.y = position.y

      thread.topLeft.y = position.y
      thread.bottomRight.x = position.x

      this.emit(Events.THREAD_UPDATING, thread)
      return
    }

    if (thread.bottomLeft.x === vertex.x && thread.bottomLeft.y === vertex.y) {
      thread.bottomLeft.x = position.x
      thread.bottomLeft.y = position.y

      thread.topLeft.x = position.x
      thread.bottomRight.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
      return
    }

    if (thread.bottomRight.x === vertex.x && thread.bottomRight.y === vertex.y) {
      thread.bottomRight.x = position.x
      thread.bottomRight.y = position.y

      thread.topRight.x = position.x
      thread.bottomLeft.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
    }
  }
}
