import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildComment,
  buildCommentPayload,
  buildCommentThread,
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

describe('comment/removeComment', () => {
  let commentThread: ReturnType<typeof buildCommentThread>
  let comment: ReturnType<typeof buildComment>
  let comment2: ReturnType<typeof buildComment>

  beforeEach(() => {
    commentThread = buildCommentThread({ id: 0 })

    const commentPayload = buildCommentPayload({
      id: 0, workflow_comment_thread_id: commentThread.id
    })
    comment = buildComment(commentPayload)

    const commentPayload2 = buildCommentPayload({
      id: 1,
      workflow_comment_thread_id: commentThread.id
    })
    comment2 = buildComment(commentPayload2)

    commentThread.comments = [comment, comment2]

    store.commit('comment/SET_THREADS', [commentThread])
    jest.spyOn(api, 'remove')
      .mockResolvedValueOnce(buildAxiosResponse({ data: commentPayload }))
      .mockResolvedValueOnce(buildAxiosResponse({ data: commentPayload2 }))
  })

  it('deletes comment from backend', async () => {
    await store.dispatch('comment/removeComment', comment)
    expect(api.remove).toHaveBeenCalledWith('workflow_comments/0')

    await store.dispatch('comment/removeComment', comment2)
    expect(api.remove).toHaveBeenCalledWith('workflow_comments/1')
  })

  it('removes comment from store, removes thread if blank', async () => {
    await store.dispatch('comment/removeComment', comment)
    expect(store.state.comment.commentThreads[0].comments).toEqual([comment2])

    await store.dispatch('comment/removeComment', comment2)
    expect(store.state.comment.commentThreads).toEqual([])
  })
})
