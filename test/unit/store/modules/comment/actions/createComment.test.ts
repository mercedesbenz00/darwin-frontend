import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentPayload,
  buildCommentThread,
  buildUserPayload,
  buildDatasetItemPayload,
  buildMembershipPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'
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

describe('comment/createComment', () => {
  let commentThread: ReturnType<typeof buildCommentThread>
  let comment: ReturnType<typeof buildComment>

  beforeEach(() => {
    const sam = buildUserPayload({ id: 5 })
    store.commit('user/SET_PROFILE', sam)

    const samMember = buildMembershipPayload({ id: 998, user_id: sam.id })
    store.commit('team/SET_MEMBERSHIPS', [samMember])

    commentThread = buildCommentThread({ id: 0 })
    store.commit('comment/SET_THREADS', [commentThread])

    const commentPayload = buildCommentPayload({
      id: 0,
      workflow_comment_thread_id: commentThread.id
    })
    comment = buildComment(commentPayload)

    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: commentPayload }))
  })

  describe('if thread is new', () => {
    let newThread: ReturnType<typeof buildCommentThread>

    beforeEach(() => {
      const item = buildDatasetItemPayload({ id: 19 })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)

      jest.spyOn(api, 'post').mockImplementation((path: string) => {
        if (path === 'dataset_items/19/workflow') {
          const updatedItem = initializeARWorkflow({ ...item, current_workflow_id: 4 })
          return Promise.resolve(buildAxiosResponse({ data: updatedItem }))
        }

        return Promise.resolve(buildAxiosResponse({ data: { } }))
      })
      newThread = buildCommentThread({ id: -1 })
      store.commit('comment/SET_THREADS', [newThread])
    })

    it('dispatches to comment/createCommentThread if thread is new', async () => {
      await store.dispatch('comment/createComment', { body: 'foo', threadId: newThread.id })

      expect(store.dispatch).toHaveBeenCalledWith('comment/createCommentThread', {
        ...newThread,
        comments: [{ body: 'foo' }],
        workflowId: -1
      })
    })
  })

  it('creates comment on backend', async () => {
    await store.dispatch('comment/createComment', { body: 'foo', threadId: commentThread.id })
    expect(api.post)
      .toHaveBeenCalledWith('workflow_comment_threads/0/workflow_comments', { body: 'foo' })
  })

  it('pushes comments into store', async () => {
    await store.dispatch('comment/createComment', { body: 'foo', threadId: commentThread.id })
    expect(store.state.comment.commentThreads[0].comments).toEqual([comment])
  })

  it('responds with store comments', async () => {
    const { data } =
      await store.dispatch('comment/createComment', { body: 'foo', threadId: commentThread.id })

    expect(data).toEqual([comment])
  })
})
