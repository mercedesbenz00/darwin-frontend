import { EventEmitter } from 'events'

import { v4 as uuidv4 } from 'uuid'

import { boundingBoxToVertices, CommentVertices } from '@/engineCommon/comment'
import { EditableImagePoint, ImagePoint, IPoint } from '@/engineCommon/point'
import {
  Comment,
  CommentThread,
  ICommentsProvider
} from '@/engineV2/iproviders/types'
import { CommentatorRenderer } from '@/engineV2/plugins/commentator/CommentatorRenderer'
import { View } from '@/engineV2/views'

enum Events {
  THREAD_CREATED = 'thread:created',
  THREAD_OPENED = 'thread:opened',
  THREAD_CLOSED = 'thread:closed',
  THREAD_UPDATED = 'thread:updated',
  THREAD_UPDATING = 'thread:updating',
  THREADS_CHANGED = 'threads:changed',
  THREAD_SELECTED = 'thread:selected',
  THREAD_DESELECTED = 'thread:deselected',

  THREAD_COMMENT_CREATED = 'thread:comment:created',
  THREAD_COMMENT_CHANGED = 'thread:comment:changed'
}

export const threadHasConflicts = (thread: CommentThread): boolean =>
  !!thread.issue_types?.length

export const getThreadVertices = (thread: CommentThread): CommentVertices => {
  const { x, y, w, h } = thread.bounding_box
  return boundingBoxToVertices({ x, y, w, h })
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
 * CommentThread has been created
 * @event thread:updating
 * CommentThread is being changed in a way that triggers rerender, but it's not final yet.
 * This means we may want to update local data, but don't want to save it.
 * We also want to be fast with the update as the render needs to be fast
 * @event thread:updated
 * CommentThread has fully updated and now needs to change.
 * @event threads:changed
 * All threads have changed and need to re-render
 */
export class CommentManager extends EventEmitter {
  private view: View

  static THREAD_CREATED = Events.THREAD_CREATED
  static THREAD_UPDATING = Events.THREAD_UPDATING
  static THREAD_UPDATED = Events.THREAD_UPDATED
  static THREAD_SELECTED = Events.THREAD_SELECTED
  static THREAD_DESELECTED = Events.THREAD_DESELECTED
  static THREADS_CHANGED = Events.THREADS_CHANGED

  static THREAD_COMMENT_CREATED = Events.THREAD_COMMENT_CREATED
  static THREAD_COMMENT_CHANGED = Events.THREAD_COMMENT_CHANGED

  private cleanupArr: (() => void)[] = []

  constructor (view: View) {
    super()
    this.view = view

    this.commentsProvider.getThreads().then(threads => {
      this.setThreads(threads.filter(t => t.slot_name === this.view.fileManager.slotName))
    })
  }

  private get commentsProvider (): ICommentsProvider {
    return this.view.editor.commentsProvider
  }

  private threadsById: Partial<{ [id: string]: CommentThread }> = {}

  get threads (): CommentThread[] {
    return Object.values(this.threadsById).filter((t): t is CommentThread => !!t)
  }

  get frameThreads (): CommentThread[] {
    return this.threads
      .filter(t => t.section_index === this.view.currentFrameIndex)
  }

  private _pushThread (payload: CommentThread): void {
    if (this.threadsById[payload.id]) { return }
    this.threadsById[payload.id] = payload
  }

  private _setThread (thread: CommentThread): void {
    this.threadsById[thread.id] = thread
  }

  private _removeThread (payload: CommentThread): void {
    delete this.threadsById[payload.id]
  }

  private setThreads (threads: CommentThread[]): void {
    this.threadsById = {}

    threads.forEach(thread => this._pushThread(thread))
    this.emit(Events.THREADS_CHANGED, this.threads)
  }

  // CRUD create

  public async createThread (
    x: number,
    y: number,
    w: number,
    h: number,
    initialComment: string
  ): Promise<CommentThread> {
    const thread = {
      id: uuidv4(),
      bounding_box: { x, y, w, h },
      section_index: this.view.currentFrameIndex,
      slot_name: this.view.fileManager.slotName
    } as CommentThread

    const response = await this.commentsProvider.createThread(thread, initialComment)

    this._pushThread(response)

    this.emit(Events.THREAD_CREATED, thread)
    this.emit(Events.THREADS_CHANGED, this.threads)

    return response
  }

  public async updateThread (payload: CommentThread): Promise<CommentThread> {
    if (!this.threadsById[payload.id]) {
      throw new Error('Something went wrong. Cannot get thread by id!')
    }

    const updatedThread = await this.commentsProvider.updateThread(payload)

    this._setThread(updatedThread)

    this.emit(Events.THREAD_UPDATED, updatedThread)
    this.emit(Events.THREADS_CHANGED, this.threads)

    return updatedThread
  }

  public async removeThread (thread: CommentThread): Promise<void> {
    if (this.selectedThreadId === thread.id) {
      this.deselectThread()
    }

    await this.commentsProvider.removeThread(thread)

    this._removeThread(thread)
  }

  // selection

  private selectedThreadId: string | null = null

  public get selectedThread (): CommentThread | null {
    if (!this.selectedThreadId) { return null }
    return this.threadsById[this.selectedThreadId] || null
  }

  public async selectThread (thread: CommentThread): Promise<void> {
    this.deselectThread()

    if (!this.threadsById[thread.id]) { return }
    this.selectedThreadId = thread.id
    this.emit(Events.THREAD_SELECTED, thread)

    if (!this.selectedThread) { throw new Error("Can't get selected thread!") }

    const comments = await this.commentsProvider.getComments(this.selectedThread)
    this._comments.set(thread.id, comments)

    this.emit(Events.THREAD_COMMENT_CHANGED, this.getComments(thread.id))

    this.once(Events.THREAD_DESELECTED, () => {
      this.emit(Events.THREAD_COMMENT_CHANGED, [])
    })
  }

  public deselectThread (): void {
    this.selectedThreadId = null
    this.emit(Events.THREAD_DESELECTED)
  }

  // Misc

  public findCommentThreadVertexAt (
    point: ImagePoint,
    threshold?: number
  ): EditableImagePoint | null {
    const thread = this.selectedThread
    if (!thread) { return null }
    const vertices = getThreadVertices(thread)
    const path = [vertices.topLeft, vertices.topRight, vertices.bottomRight, vertices.bottomLeft]
    return this.view.findVertexAtPath([path], point, threshold) || null
  }

  public findTopCommentThreadAt (point: ImagePoint): CommentThread | null {
    const matched = this.threads.find(thread => {
      if (thread.section_index !== null && this.view.currentFrameIndex !== thread.section_index) {
        return false
      }

      const vertices = getThreadVertices(thread)
      const path = [vertices.topLeft, vertices.topRight, vertices.bottomRight, vertices.bottomLeft]
      if (thread.id === this.selectedThreadId) {
        return this.view.isPointInPath(point, path)
      }

      const renderer = this.view.renderManager.rendererFor('commentator') as CommentatorRenderer
      if (!renderer) { return null }

      // TODO: update renderer type
      const centroidRectPath = renderer.getCentroidRectPath(thread as any)

      const conflict = threadHasConflicts(thread)
      return this.view.isPointInPath(point, conflict ? path : centroidRectPath)
    })

    return matched || null
  }

  public moveBox (thread: CommentThread, offset: IPoint): void {
    if (!this.threadsById[thread.id]) { return }
    const vertices = getThreadVertices(thread)

    vertices.topLeft.x += offset.x
    vertices.topLeft.y += offset.y
    vertices.topRight.x += offset.x
    vertices.topRight.y += offset.y
    vertices.bottomLeft.x += offset.x
    vertices.bottomLeft.y += offset.y
    vertices.bottomRight.x += offset.x
    vertices.bottomRight.y += offset.y

    this.emit(Events.THREAD_UPDATING, thread)
  }

  public moveVertex (thread: CommentThread, vertex: ImagePoint, position: IPoint): void {
    // we move the vertex,
    // since it needs to be an orthogonal bounding box, we also move
    // neighboring vertices that are affected
    const vertices = getThreadVertices(thread)

    if (vertices.topLeft.x === vertex.x && vertices.topLeft.y === vertex.y) {
      vertices.topLeft.x = position.x
      vertices.topLeft.y = position.y

      vertices.bottomLeft.x = position.x
      vertices.topRight.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
      return
    } if (vertices.topRight.x === vertex.x && vertices.topRight.y === vertex.y) {
      vertices.topRight.x = position.x
      vertices.topRight.y = position.y

      vertices.topLeft.y = position.y
      vertices.bottomRight.x = position.x

      this.emit(Events.THREAD_UPDATING, thread)
      return
    }

    if (vertices.bottomLeft.x === vertex.x && vertices.bottomLeft.y === vertex.y) {
      vertices.bottomLeft.x = position.x
      vertices.bottomLeft.y = position.y

      vertices.topLeft.x = position.x
      vertices.bottomRight.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
      return
    }

    if (vertices.bottomRight.x === vertex.x && vertices.bottomRight.y === vertex.y) {
      vertices.bottomRight.x = position.x
      vertices.bottomRight.y = position.y

      vertices.topRight.x = position.x
      vertices.bottomLeft.y = position.y

      this.emit(Events.THREAD_UPDATING, thread)
    }
  }

  // Comments

  private _comments: Map<string, Comment[]> = new Map()

  public getComments (threadId: CommentThread['id']): Comment[] {
    return this._comments.get(threadId) || []
  }

  // CRUD comments

  async createComment (
    threadId: CommentThread['id'],
    body: string
  ): Promise<Comment> {
    const thread = this.threadsById[threadId]
    if (!thread) { throw new Error("Can't get thread by id!") }

    const comment = await this.commentsProvider.createComment(body, thread)

    this.threadsById[threadId] = {
      ...thread,
      comment_count: thread.comment_count + 1
    }

    this._comments.set(threadId, [...this.getComments(threadId), comment])

    this.emit(Events.THREAD_COMMENT_CREATED, this.getComments(threadId))

    return comment
  }

  clear (): void {
    this.cleanupArr.forEach(fn => fn())
    this.cleanupArr = []
    this._comments.clear()
    this.threadsById = {}
    this.selectedThreadId = null
  }
}
