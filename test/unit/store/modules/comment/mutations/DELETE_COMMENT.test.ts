import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildComment, buildCommentThread } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('comment/DELETE_COMMENT', () => {
  it('deletes comment', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })
    const comment = buildComment({ id: 1, workflow_comment_thread_id: commentThread.id })
    const comment2 = buildComment({ id: 2, workflow_comment_thread_id: commentThread.id })
    commentThread.comments = [comment, comment2]
    store.commit('comment/SET_THREADS', [commentThread])
    store.commit('comment/DELETE_COMMENT', comment)
    expect(store.state.comment.commentThreads[0].comments).toEqual([comment2])
  })

  it('deletes the parent comment thread if no comments left', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })
    const comment = buildComment({ id: 1, workflow_comment_thread_id: commentThread.id })
    commentThread.comments = [comment]
    store.commit('comment/SET_THREADS', [commentThread])
    store.commit('comment/DELETE_COMMENT', comment)
    expect(store.state.comment.commentThreads).toEqual([])
  })
})
