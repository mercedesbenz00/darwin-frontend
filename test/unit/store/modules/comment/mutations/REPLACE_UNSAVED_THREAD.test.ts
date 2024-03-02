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

describe('comment/REPLACE_UNSAVED_THREAD', () => {
  it('replaces unsaved comment thread', () => {
    const unsavedThread = buildCommentThread({ id: -1, author_id: 1 })
    store.commit('comment/SET_THREADS', [unsavedThread])

    const savedThread = { ...unsavedThread, id: 1 }
    store.commit('comment/REPLACE_UNSAVED_THREAD', savedThread)
    expect(store.state.comment.commentThreads).toEqual([savedThread])
  })
})
