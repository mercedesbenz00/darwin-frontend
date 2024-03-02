import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildCommentThread,
  buildCommentThreadPayload,
  buildUserPayload
} from 'test/unit/factories'
import { mockApi } from 'test/unit/mocks/mockApi'

import { api } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 7 }))
})

describe('comment/removeCommentThread', () => {
  let payload: ReturnType<typeof buildCommentThreadPayload>
  let thread: ReturnType<typeof buildCommentThread>

  beforeEach(() => {
    payload = buildCommentThreadPayload({ id: 1, workflow_id: 5, author_id: 7 })
    thread = buildCommentThread({ ...payload, id: 1 })

    store.commit('comment/SET_THREADS', [thread])

    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({ data: payload }))
  })

  it('sends API request', async () => {
    await store.dispatch('comment/removeCommentThread', thread)
    expect(api.remove).toHaveBeenCalledWith('workflow_comment_threads/1')
  })

  it('replaces comment thread from store', async () => {
    await store.dispatch('comment/removeCommentThread', thread)
    expect(store.state.comment.commentThreads).toEqual([])
  })
})
