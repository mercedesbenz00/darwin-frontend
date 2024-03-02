import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

import { V2CommentPayload, V2CommentThreadPayload } from '@/store/types'
import { unixNowMs, unixToIso } from '@/utils'
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

type Comment = V2CommentPayload & { isNew?: boolean }
type CommentThread = V2CommentThreadPayload & { isNew?: boolean }

type CommentsById = Partial<{ [id: string]: Comment }>
type ThreadsById = Partial<{ [id: string]: CommentThread }>

type State = {
  /**
   * All backend paths are scoped to team slug, so we need to hold it in state
   * to be able to perform any backend action
   *
   * Effectively, the store is for a team slug and is emptied when team slug changes.
   */
  teamSlug: string | null

  /**
   * A full list of all loaded threads
   */
  threads: CommentThread[]

  /**
   * A map where keys are comment thread ids and values are comment threads
   */
  threadsById: ThreadsById

  /**
   * A map where keys are comment ids and values are comments
   */
  commentsById: CommentsById

  /**
   * A map where keyes are comment thread ids for threads where comments have been loaded,
   * and values are loaded comments, mapped by id.
   */
  comments: Comment[]

  activeThreadId: string | null
}

/**
 * The store for managing workview 2.0 comments.
 *
 * Fetches and holds comment threads which can be looked up by dataset item id,
 * or by thread id, as well as comments which can be looked up by thread id or
 * by comment id.
 */
export const useCommentStore = defineStore('comments', {
  state: (): State => ({
    teamSlug: null,
    commentsById: {},
    comments: [],
    threadsById: {},
    threads: [],
    activeThreadId: null
  }),
  getters: {
    /** Returns the currently active (open) thread */
    activeThread (state): CommentThread | null {
      if (!state.activeThreadId) { return null }
      return state.threadsById[state.activeThreadId] || null
    }
  },
  actions: {
    /**
     * Sets new team slug into the store and clears out store
     */
    setTeamSlug (slug: string): void {
      this.teamSlug = slug
      this.threads = []
      this.comments = []
      this.commentsById = {}
      this.threadsById = {}
    },
    /**
     * Fetches all comment threads for a dataset item from the backend and loads them into store.
     */
    async loadCommentThreads (datasetItemId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to load comment threads without setting a team first')
        return
      }

      const result = await loadV2CommentThreads({
        teamSlug: this.teamSlug,
        datasetItemId
      })

      if ('data' in result) {
        this.threads = result.data
        result.data.forEach(thread => {
          this.threadsById[thread.id] = thread
        })
      }
    },

    /**
     * Adds an unsaved comment thread, to be saved once the user provides a comment body
     */
    addNewCommentThread (
      datasetItemId: string,
      payload: {
        threadId: string
        authorId: number
        boundingBox: { x: number, y: number, w: number, h: number }
        sectionIndex: number | null
        slotName: string
      }
    ) {
      const now = unixToIso(unixNowMs())
      const newThread: CommentThread = {
        id: payload.threadId,
        author_id: payload.authorId,
        dataset_item_id: datasetItemId,
        bounding_box: payload.boundingBox,
        section_index: payload.sectionIndex,
        slot_name: payload.slotName,
        comment_count: 0,
        inserted_at: now,
        updated_at: now,
        resolved: false,
        isNew: true,
        issue_data: null,
        issue_types: null
      }

      const removedThreads = this.threads.filter(t => t.isNew)

      this.threads = this.threads.filter(t => !t.isNew)
      this.threads.push(newThread)

      removedThreads.forEach(t => { delete this.threadsById[t.id] })
      this.threadsById[newThread.id] = newThread

      this.addNewComment(newThread.id, payload.authorId)
    },

    saveCommentThread (threadId: string) {
      const thread = this.threadsById[threadId]
      if (!thread) { return }
      if (thread.isNew) { return this.createCommentThread(threadId) }
      return this.updateCommentThread(threadId)
    },

    async createCommentThread (threadId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to load comment threads without setting a team first')
        return
      }

      const thread = this.threadsById[threadId]
      if (!thread) { return }
      if (!thread.isNew) { return }

      const comment = this.comments.find(c => c.comment_thread_id === threadId)
      if (!comment) { return }

      const result = await createV2CommentThread({
        comments: [{ body: comment.body }],
        boundingBox: thread.bounding_box,
        datasetItemId: thread.dataset_item_id,
        sectionIndex: thread.section_index ?? undefined,
        slotName: thread.slot_name,
        teamSlug: this.teamSlug
      })

      if (!('data' in result)) { return }

      thread.author_id = result.data.author_id
      thread.comment_count = result.data.comment_count
      thread.id = result.data.id
      thread.inserted_at = result.data.inserted_at
      thread.updated_at = result.data.updated_at
      thread.isNew = false

      delete this.threadsById[thread.id]
      this.threadsById[result.data.id] = thread

      this.removeComment(comment.id)
      this.setActiveThreadId(thread.id)

      await this.loadComments(thread.id)
    },

    async updateCommentThread (threadId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to load comment threads without setting a team first')
        return
      }

      const thread = this.threadsById[threadId]
      if (!thread) { return }
      if (thread.isNew) { return }

      const result = await updateV2CommentThread({
        boundingBox: thread.bounding_box,
        datasetItemId: thread.dataset_item_id,
        teamSlug: this.teamSlug,
        resolved: thread.resolved,
        threadId
      })

      if (!('data' in result)) { return }
      thread.updated_at = result.data.updated_at
      thread.bounding_box = result.data.bounding_box
      thread.resolved = result.data.resolved
    },

    /**
     * Marks a comment thread specified by id as resolved on the backend and updates in store
     */
    async resolveCommentThread (threadId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to load comment threads without setting a team first')
        return
      }

      const thread = this.threadsById[threadId]
      if (!thread) { return }

      const result = await updateV2CommentThread({
        teamSlug: this.teamSlug,
        datasetItemId: thread.dataset_item_id,
        threadId,
        resolved: true
      })

      if ('data' in result) {
        thread.resolved = true
        thread.updated_at = result.data.updated_at
      }
    },

    removeThread (threadId: string) {
      const removedComments = this.comments.filter(c => c.comment_thread_id === threadId)
      this.comments = this.comments.filter(c => c.comment_thread_id !== threadId)
      removedComments.forEach(c => { delete this.commentsById[c.id] })

      this.threads = this.threads.filter(t => t.id !== threadId)
      delete this.threadsById[threadId]

      if (this.activeThreadId === threadId) {
        this.unsetActiveThreadId()
      }
    },

    /**
     * Deletes a comment thread from the backend and unloads from store
     */
    async deleteCommentThread (threadId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to update comment thread without setting a team first')
        return
      }

      const thread = this.threadsById[threadId]
      if (!thread) { return }

      if (!thread.isNew) {
        const result = await deleteV2CommentThread({
          teamSlug: this.teamSlug,
          datasetItemId: thread.dataset_item_id,
          threadId
        })
        if ('data' in result) {
          this.removeThread(threadId)
        }
      } else {
        this.removeThread(threadId)
      }
    },

    /**
     * Fetches comments for a thread from the backend and loads them into store
     */
    async loadComments (threadId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to load comment threads without setting a team first')
        return
      }

      const thread = this.threadsById[threadId]
      if (!thread) { return }

      const result = await loadV2Comments({
        datasetItemId: thread.dataset_item_id,
        teamSlug: this.teamSlug,
        threadId
      })

      if ('data' in result) {
        const removedComments = this.comments.filter(c => c.comment_thread_id === threadId)
        removedComments.forEach(c => { delete this.commentsById[c.id] })

        const loadedComments = result.data
        this.comments =
          this.comments.filter(c => c.comment_thread_id !== threadId).concat(loadedComments)

        loadedComments.forEach(comment => {
          this.commentsById[comment.id] = comment
        })
      }

      return result
    },

    /**
     * Adds an unsaved comment to a thread.
     *
     * Used when starting a reply to a thread.s
     */
    addNewComment (threadId: string, authorId: number) {
      const thread = this.threadsById[threadId]
      if (!thread) { return }

      const now = unixToIso(unixNowMs())
      const commentId = uuidv4()
      const newComment = {
        comment_thread_id: threadId,
        id: commentId,
        author_id: authorId,
        body: '',
        updated_at: now,
        inserted_at: now,
        isNew: true
      }

      const removedComments = this.threads.filter(c => c.isNew)
      this.comments = this.comments.filter(c => !c.isNew)
      this.comments.push(newComment)
      removedComments.forEach((c) => {
        delete this.commentsById[c.id]
      })
      this.commentsById[newComment.id] = newComment
    },

    /**
     * Updates a comment on the backend and in the store. Used when submitting a reply.
     *
     * If the thread itself is unsaved, it will save it as well.
     */
    async updateComment (commentId: string, body: string) {
      if (!this.teamSlug) {
        console.warn('Tried to create comment without setting a team first')
        return
      }

      const comment = this.commentsById[commentId]
      if (!comment) { return }

      const thread = this.threadsById[comment.comment_thread_id]
      if (!thread) { return }

      if (thread.isNew) {
        comment.body = body
        return this.saveCommentThread(thread.id)
      }

      const result = comment.isNew
        ? await createV2Comment({
          body,
          datasetItemId: thread.dataset_item_id,
          teamSlug: this.teamSlug,
          threadId: thread.id
        })
        : await updateV2Comment({
          body,
          commentId,
          datasetItemId: thread.dataset_item_id,
          teamSlug: this.teamSlug,
          threadId: thread.id
        })

      if ('data' in result) {
        // if the comment was new, we need to update mapped reference and replace id
        if (comment.id !== result.data.id) {
          // remove old comment
          delete this.commentsById[comment.id]

          // add in/update new comment
          comment.id = result.data.id
          comment.inserted_at = result.data.inserted_at

          this.commentsById[comment.id] = comment
        }

        if (comment.isNew) {
          comment.isNew = false
          thread.comment_count += 1
        }

        comment.body = result.data.body
        comment.updated_at = result.data.updated_at
      }
    },

    /**
     * Removes an unsaved comment from the store. Used when cancelling a reply.
     */
    removeComment (commentId: string) {
      const comment = this.commentsById[commentId]
      if (!comment) { return }
      const thread = this.threadsById[comment.comment_thread_id]
      if (!thread) { return }

      this.comments = this.comments.filter(c => c.id !== comment.id)
      delete this.commentsById[comment.id]

      const remaining = this.comments.filter(c => c.comment_thread_id === comment.comment_thread_id)
      if (remaining.length === 0) {
        this.removeThread(comment.comment_thread_id)
      }
    },

    /**
     * Deletes a comment from the backend and unloads it from store
     */
    async deleteComment (commentId: string) {
      if (!this.teamSlug) {
        console.warn('Tried to create comment without setting a team first')
        return
      }

      const comment = this.commentsById[commentId]
      if (!comment) { return }

      const thread = this.threadsById[comment.comment_thread_id]
      if (!thread) { return }

      const result = await deleteV2Comment({
        commentId,
        datasetItemId: thread.dataset_item_id,
        teamSlug: this.teamSlug,
        threadId: thread.id
      })

      if ('data' in result) {
        thread.comment_count -= 1
        this.removeComment(commentId)
      }
    },

    /**
     * Sets the id of the currently active (open) thread
     */
    setActiveThreadId (threadId: string) {
      this.unsetActiveThreadId()
      this.activeThreadId = threadId
    },

    /**
     * Unset active (open) thread id.
     *
     * If the thread was new and unsaved, it will be discarded
     */
    unsetActiveThreadId () {
      if (!this.activeThreadId) { return }

      const thread = this.threadsById[this.activeThreadId]
      if (thread && thread.isNew) { this.removeThread(thread.id) }

      this.activeThreadId = null
    }
  }
})

export type CommentStore = ReturnType<typeof useCommentStore>
