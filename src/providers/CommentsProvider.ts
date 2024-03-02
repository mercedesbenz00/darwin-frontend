import { EventEmitter } from 'events'

import { ICommentsProvider } from '@/engineV2/iproviders/types'
import {
  Comment,
  CommentThread
} from '@/engineV2/iproviders/types'
import store from '@/store'
import {
  createV2Comment,
  createV2CommentThread,
  deleteV2Comment,
  deleteV2CommentThread,
  loadV2Comments,
  loadV2CommentThreads,
  updateV2Comment,
  updateV2CommentThread
} from '@/utils/backend'

enum Events {
  THREADS_CHANGED = 'threads:changed'
}

export class CommentsProvider extends EventEmitter implements ICommentsProvider {
  static THREADS_CHANGED = Events.THREADS_CHANGED

  async getThreads (): Promise<CommentThread[]> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) {
      console.warn('Tried to load comment threads without setting a team first')
      return []
    }

    if (!store.state.workview.selectedDatasetItemV2Id) {
      throw new Error('selectedDatasetItemV2Id is not set!')
    }

    const result = await loadV2CommentThreads({
      teamSlug,
      datasetItemId: store.state.workview.selectedDatasetItemV2Id
    })

    if ('data' in result) {
      return result.data
    }

    if ('error' in result) {
      return Promise.reject(result)
    }

    return Promise.reject()
  }

  requestThreadsReload (): void {
    this.emit(CommentsProvider.THREADS_CHANGED)
  }

  async createThread (
    payload: CommentThread,
    initialComment: string
  ): Promise<CommentThread> {
    const currentItemId = store.state.workview.selectedDatasetItemV2Id
    if (!currentItemId) { throw new Error('selectedDatasetItemV2Id is not set!') }

    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await createV2CommentThread({
      comments: [{ body: initialComment }],
      boundingBox: payload.bounding_box,
      datasetItemId: payload.dataset_item_id,
      sectionIndex: payload.section_index ?? undefined,
      slotName: payload.slot_name,
      teamSlug
    })

    if (!('data' in result)) {
      return Promise.reject(result)
    }

    return result.data
  }

  async updateThread (payload: CommentThread): Promise<CommentThread> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await updateV2CommentThread({
      boundingBox: payload.bounding_box,
      datasetItemId: payload.dataset_item_id,
      resolved: payload.resolved,
      threadId: payload.id,
      teamSlug
    })

    if (!('data' in result)) {
      return Promise.reject(result)
    }

    return result.data
  }

  async removeThread (payload: CommentThread): Promise<void> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await deleteV2CommentThread({
      teamSlug,
      datasetItemId: payload.dataset_item_id,
      threadId: payload.id
    })

    if ('data' in result) {
      return Promise.resolve()
    }

    return Promise.reject()
  }

  async resolveThread (payload: CommentThread): Promise<CommentThread> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await updateV2CommentThread({
      teamSlug,
      datasetItemId: payload.dataset_item_id,
      threadId: payload.id,
      resolved: true
    })

    if ('data' in result) {
      return Promise.resolve(result.data)
    }

    return Promise.reject(result)
  }

  unreadThread (): Promise<void> {
    return Promise.resolve()
  }

  async getComments (thread: CommentThread): Promise<Comment[]> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await loadV2Comments({
      datasetItemId: thread.dataset_item_id,
      teamSlug,
      threadId: thread.id
    })

    if ('data' in result) {
      return Promise.resolve(result.data)
    }

    return Promise.reject(result)
  }

  async createComment (
    body: string,
    thread: CommentThread
  ): Promise<Comment> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await createV2Comment({
      body: body,
      datasetItemId: thread.dataset_item_id,
      teamSlug,
      threadId: thread.id
    })

    if ('data' in result) {
      return Promise.resolve(result.data)
    }

    return Promise.reject(result)
  }

  async updateComment (
    comment: Comment,
    thread: CommentThread
  ): Promise<Comment> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await updateV2Comment({
      body: comment.body,
      commentId: comment.id,
      datasetItemId: thread.dataset_item_id,
      teamSlug: teamSlug,
      threadId: thread.id
    })

    if ('data' in result) {
      return Promise.resolve(result.data)
    }

    return Promise.reject(result)
  }

  async removeComment (comment: Comment, thread: CommentThread): Promise<void> {
    const teamSlug = store.state.team.currentTeam?.slug
    if (!teamSlug) { throw new Error('Tried to load comment threads without setting a team first') }

    const result = await deleteV2Comment({
      commentId: comment.id,
      datasetItemId: thread.dataset_item_id,
      teamSlug,
      threadId: thread.id
    })

    if ('data' in result) {
      return Promise.resolve()
    }

    return Promise.reject()
  }
}
