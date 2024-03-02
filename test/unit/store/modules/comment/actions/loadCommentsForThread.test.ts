import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentPayload,
  buildCommentThread,
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
})

describe('comment/loadCommentsForThread', () => {
  let commentThread: ReturnType<typeof buildCommentThread>
  let comment: ReturnType<typeof buildComment>

  beforeEach(() => {
    commentThread = buildCommentThread({ id: 0 })
    store.commit('comment/SET_THREADS', [commentThread])

    const commentPayload = buildCommentPayload({
      id: 0,
      workflow_comment_thread_id: commentThread.id
    })

    comment = buildComment(commentPayload)

    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [commentPayload] }))
  })

  it('requests comments from backend', async () => {
    await store.dispatch('comment/loadCommentsForThread', commentThread)
    expect(api.get).toHaveBeenCalledWith('workflow_comment_threads/0/workflow_comments')
  })

  it('pushes comments into store', async () => {
    await store.dispatch('comment/loadCommentsForThread', commentThread)
    expect(store.state.comment.commentThreads)
      .toEqual([{ ...commentThread, comments: [comment] }])
  })

  it('responds with store comments', async () => {
    const { data } = await store.dispatch('comment/loadCommentsForThread', commentThread)
    expect(data).toEqual([comment])
  })
})
