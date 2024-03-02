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

describe('comment/updateCommentThread', () => {
  let thread: ReturnType<typeof buildCommentThread>

  beforeEach(() => {
    const payload = buildCommentThreadPayload({ id: 1, workflow_id: 5 })
    thread = buildCommentThread({ ...payload, id: 1 })

    store.commit('comment/SET_THREADS', [thread])

    jest.spyOn(api, 'put').mockResolvedValue(
      buildAxiosResponse({ data: { ...payload, resolved: true } })
    )
  })

  it('sends API request', async () => {
    await store.dispatch('comment/updateCommentThread', { ...thread, resolved: true })
    expect(api.put).toHaveBeenCalledWith('workflow_comment_threads/1', {
      bounding_box: thread.boundingBox,
      resolved: true
    })
  })

  it('never sends API request without frameIndex', async () => {
    await store.dispatch('comment/updateCommentThread', { ...thread, frameIndex: 10, resolved: true })
    expect(api.put).toHaveBeenCalledWith('workflow_comment_threads/1', {
      bounding_box: thread.boundingBox,
      resolved: true
    })
  })

  it('replaces comment thread from store', async () => {
    await store.dispatch('comment/updateCommentThread', { ...thread, resolved: true })
    expect(store.state.comment.commentThreads).toEqual([{ ...thread, resolved: true }])
  })
})
