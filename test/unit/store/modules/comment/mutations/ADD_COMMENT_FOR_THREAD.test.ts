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

describe('comment/ADD_COMMENT_FOR_THREAD', () => {
  it('adds new comment to workflow comment thread', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })
    commentThread.comments = []
    store.commit('comment/SET_THREADS', [commentThread])

    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, comments: [] }])

    const comment = buildComment({ workflow_comment_thread_id: 0 })
    store.commit('comment/ADD_COMMENT_FOR_THREAD', comment)
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, comments: [comment] }])
  })
})
