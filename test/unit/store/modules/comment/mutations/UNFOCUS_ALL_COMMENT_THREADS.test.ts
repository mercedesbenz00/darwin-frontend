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

describe('comment/UNFOCUS_ALL_COMMENT_THREADS', () => {
  it('unhighlights all comment threads', () => {
    const commentThread = buildCommentThread({ id: 0, author_id: 1 })
    commentThread.isHighlighted = true

    store.commit('comment/SET_THREADS', [commentThread])

    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isHighlighted: true }])

    store.commit('comment/UNFOCUS_ALL_COMMENT_THREADS')
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, isHighlighted: false }])
  })
})
