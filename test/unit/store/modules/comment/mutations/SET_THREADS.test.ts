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

describe('comment/SET_THREADS', () => {
  it('sets workflow comment threads', () => {
    const commentThread = buildCommentThread({ id: 0 })

    store.commit('comment/SET_THREADS', [commentThread])
    expect(store.state.comment.commentThreads).toEqual([commentThread])
  })
})
