import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentThread
} from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('comment/UPDATE_COMMENT_FOR_THREAD', () => {
  it('updates comment within the parent comment thread', () => {
    const commentThread = buildCommentThread({ id: 1, author_id: 1 })
    const comment = buildComment({
      id: 0,
      workflow_comment_thread_id: commentThread.id,
      body: 'aaa'
    })
    commentThread.comments = [comment]
    store.commit('comment/SET_THREADS', [commentThread])

    const comment2 = buildComment({
      id: 0,
      workflow_comment_thread_id: commentThread.id,
      body: 'bbb'
    })

    store.commit('comment/UPDATE_COMMENT_FOR_THREAD', comment2)

    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, comments: [comment2] }])
  })
})
