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

describe('comment/RESOLVE_COMMENT_THREAD', () => {
  it('sets resolved flag on comment thread', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })

    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, resolved: false }])

    store.commit('comment/RESOLVE_COMMENT_THREAD', commentThread.id)
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, resolved: true }])
  })
})
