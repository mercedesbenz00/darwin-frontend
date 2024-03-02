import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentPayload,
  buildCommentThread,
  buildUserPayload,
  buildAxiosResponse
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

describe('comment/updateComment', () => {
  let commentThread: ReturnType<typeof buildCommentThread>
  let comment: ReturnType<typeof buildComment>

  beforeEach(() => {
    commentThread = buildCommentThread({ id: 0 })

    const commentPayload = buildCommentPayload({
      id: 0,
      workflow_comment_thread_id: commentThread.id
    })
    comment = buildComment(commentPayload)
    commentThread.comments = [comment]

    store.commit('comment/SET_THREADS', [commentThread])
    jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: { ...commentPayload, body: 'bar' } }))
  })

  it('creates comment on backend', async () => {
    await store.dispatch('comment/updateComment', { ...comment, body: 'bar' })
    expect(api.put).toHaveBeenCalledWith('workflow_comments/0', { body: 'bar' })
  })

  it('pushes comments into store', async () => {
    await store.dispatch('comment/updateComment', { ...comment, body: 'bar' })
    expect(store.state.comment.commentThreads[0].comments)
      .toEqual([{ ...comment, body: 'bar' }])
  })

  it('responds with store comments', async () => {
    const { data } = await store.dispatch('comment/updateComment', { ...comment, body: 'bar' })
    expect(data).toEqual({ ...comment, body: 'bar' })
  })
})
