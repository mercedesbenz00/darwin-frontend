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

describe('comment/SELECT_COMMENT_THREAD', () => {
  it('selects comment thread', () => {
    const commentThread = buildCommentThread({ id: 1, author_id: 1 })

    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isSelected: false }])

    store.commit('comment/SELECT_COMMENT_THREAD', commentThread)
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isSelected: true }])
  })
})
