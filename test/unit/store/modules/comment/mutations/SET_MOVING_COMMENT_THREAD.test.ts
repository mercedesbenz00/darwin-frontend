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

describe('comment/SET_MOVING_COMMENT_THREAD', () => {
  it('sets moving flag on comment thread', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })

    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isMoving: false }])

    store.commit('comment/SET_MOVING_COMMENT_THREAD', commentThread)
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isMoving: true }])
  })
})
