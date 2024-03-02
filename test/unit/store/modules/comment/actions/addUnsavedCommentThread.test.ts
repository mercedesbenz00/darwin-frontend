import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildCommentThread,
  buildCommentThreadPayload,
  buildUserPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 7 }))
})

describe('comment/addUnsavedCommentThread', () => {
  let payload: ReturnType<typeof buildCommentThreadPayload>
  let thread: ReturnType<typeof buildCommentThread>

  beforeEach(() => {
    payload = buildCommentThreadPayload({ id: 1, workflow_id: 5, author_id: 7 })
    thread = buildCommentThread({ ...payload, id: -1 })
  })

  it('adds unsaved thread to store', async () => {
    await store.dispatch('comment/addUnsavedCommentThread', thread)
    expect(store.state.comment.commentThreads).toEqual([thread])
  })
})
