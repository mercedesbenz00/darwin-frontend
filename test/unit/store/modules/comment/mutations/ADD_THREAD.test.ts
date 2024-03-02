import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildCommentThread } from 'test/unit/factories'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('comment/ADD_THREAD', () => {
  it('adds new comment thread', () => {
    const commentThread1 = buildCommentThread({ id: 0, author_id: 1 })
    const commentThread2 = buildCommentThread({ id: 1, author_id: 2 })

    store.commit('comment/SET_THREADS', [commentThread1])
    expect(store.state.comment.commentThreads).toEqual([commentThread1])
    store.commit('comment/ADD_THREAD', commentThread2)
    expect(store.state.comment.commentThreads).toEqual([commentThread1, commentThread2])
  })
})