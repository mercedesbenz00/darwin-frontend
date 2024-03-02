import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildCommentThreadPayload, buildAxiosResponse } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
import { mockApi } from 'test/unit/mocks/mockApi'

import { getCommentThread } from '@/store/modules/comment/serializer'
import { CommentThreadPayload } from '@/store/types'
import { api } from '@/utils'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

mockApi()

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('comment/loadCommentThreads', () => {
  let payload: CommentThreadPayload
  const item = initializeARWorkflow({ current_workflow_id: 2 })

  beforeEach(() => {
    payload = buildCommentThreadPayload({ id: 1 })
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [payload] }))
  })

  it('request threads from backend', async () => {
    await store.dispatch('comment/loadCommentThreads', item.current_workflow)
    expect(api.get).toHaveBeenCalledWith('workflows/2/workflow_comment_threads')
  })

  it('normalizes and pushes data to store', async () => {
    await store.dispatch('comment/loadCommentThreads', item.current_workflow)
    expect(store.state.comment.commentThreads).toEqual([getCommentThread(payload)])
  })

  it('responds with data from store', async () => {
    const { data } =
      await store.dispatch('comment/loadCommentThreads', item.current_workflow)
    expect(data).toEqual([getCommentThread(payload)])
  })
})
