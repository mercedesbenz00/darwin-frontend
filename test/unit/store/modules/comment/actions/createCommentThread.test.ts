import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildComment,
  buildCommentThread,
  buildCommentThreadPayload,
  buildUserPayload,
  buildDatasetItemPayload,
  buildMembershipPayload,
  buildDatasetPayload,
  buildAxiosResponse
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

jest.mock('@/utils/backend', () => ({
  assignStage: jest.fn().mockResolvedValue({ data: {} }),
  createCommentThread: jest.fn().mockResolvedValue({ data: {} }),
  createWorkflow: jest.fn().mockResolvedValue({ data: {} }),
  loadDatasetItem: jest.fn().mockResolvedValue({ data: {} }),
  loadDatasetClassCounts: jest.fn().mockResolvedValue({ data: {} }),
  loadDatasetGeneralCounts: jest.fn().mockResolvedValue({ data: {} }),
  loadDatasetStatusCounts: jest.fn().mockResolvedValue({ data: {} })
}))

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload({ id: 7 }))
})

describe('comment/createCommentThread', () => {
  let payload: ReturnType<typeof buildCommentThreadPayload>
  let thread: ReturnType<typeof buildCommentThread>

  beforeEach(() => {
    payload = buildCommentThreadPayload({ id: -1, workflow_id: -1, author_id: -1 })
    thread = buildCommentThread(payload)
    thread.comments = [buildComment({ body: 'foo' })]

    store.commit('comment/SET_THREADS', [thread])
    store.commit('workview/SET_DATASET', buildDatasetPayload({ id: 5 }))

    jest.spyOn(backend, 'createCommentThread').mockResolvedValue(buildAxiosResponse({
      data: { ...payload, id: 1, workflow_id: 4, author_id: 7 }
    }))
  })

  describe('when no item', () => {
    it('throws', () => {
      expect(store.dispatch('comment/createCommentThread', thread)).rejects.toThrow()
    })
  })

  describe('with item', () => {
    let item: ReturnType<typeof buildDatasetItemPayload>

    beforeEach(() => {
      item = buildDatasetItemPayload({ id: 19, dataset_image_id: 21 })
      store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
    })

    describe('signed out', () => {
      beforeEach(() => {
        store.commit('user/SET_PROFILE', null)
      })

      it('throws', () => {
        expect(store.dispatch('comment/createCommentThread', thread)).rejects.toThrow()
      })
    })

    let sam: ReturnType<typeof buildUserPayload>
    let samMember: ReturnType<typeof buildMembershipPayload>

    describe('not team member', () => {
      beforeEach(() => {
        sam = buildUserPayload({ id: 5 })
        store.commit('user/SET_PROFILE', sam)
        store.commit('team/SET_MEMBERSHIPS', [])
      })

      it('throws', () => {
        expect(store.dispatch('comment/createCommentThread', thread)).rejects.toThrow()
      })
    })

    describe('no workflow', () => {
      beforeEach(() => {
        sam = buildUserPayload({ id: 5 })
        store.commit('user/SET_PROFILE', sam)

        samMember = buildMembershipPayload({ id: 998, user_id: sam.id })
        store.commit('team/SET_MEMBERSHIPS', [samMember])

        jest.spyOn(backend, 'createWorkflow').mockImplementation(({ datasetItemId }) => {
          if (datasetItemId === 19) {
            const updatedItem = initializeARWorkflow({ ...item, current_workflow_id: 4 })
            return Promise.resolve(buildAxiosResponse({ data: updatedItem }))
          }

          return Promise.resolve(buildAxiosResponse({ data: { } }))
        })
      })

      it('sends backend request', async () => {
        await store.dispatch('comment/createCommentThread', thread)

        expect(backend.createCommentThread).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: 4,
            boundingBox: payload.bounding_box,
            comments: [{ body: 'foo' }]
          })
        )
      })

      it('sends backend request with frame index', async () => {
        thread.frameIndex = 10
        await store.dispatch('comment/createCommentThread', thread)

        expect(backend.createCommentThread).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: 4,
            boundingBox: payload.bounding_box,
            frameIndex: 10,
            comments: [{ body: 'foo' }]
          })
        )
      })

      it('replaces empty comment thread in store', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.state.comment.commentThreads)
          .toContainEqual(expect.objectContaining({ authorId: 7, workflowId: 4, id: 1 }))
      })

      it('creates workflow', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.dispatch).toHaveBeenCalledWith('workview/createWorkflow', item)
      })

      it('assigns stage', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        const stage = store.state.workview.datasetItems[0].current_workflow!.stages[1][0]
        expect(store.dispatch)
          .toHaveBeenCalledWith('workview/assignStage', { stage, userId: samMember.user_id })
      })
    })

    describe('unassigned stage', () => {
      beforeEach(() => {
        sam = buildUserPayload({ id: 5 })
        store.commit('user/SET_PROFILE', sam)

        samMember = buildMembershipPayload({ id: 998, user_id: sam.id })
        store.commit('team/SET_MEMBERSHIPS', [samMember])

        const updatedItem = initializeARWorkflow(item)
        store.commit('workview/PUSH_DATASET_ITEMS', [updatedItem])
        store.commit('workview/SET_SELECTED_DATASET_ITEM', updatedItem)

        const stage = updatedItem.current_workflow!.stages[1][0]
        const assignedStage = { ...stage, assignee_id: 5 }
        jest.spyOn(backend, 'assignStage')
          .mockResolvedValue(buildAxiosResponse({ data: assignedStage }))

        jest.spyOn(backend, 'loadDatasetItem')
          .mockResolvedValue(buildAxiosResponse({ data: updatedItem }))
      })

      it('sends backend request', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(backend.createCommentThread).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: 4,
            boundingBox: payload.bounding_box,
            comments: [{ body: 'foo' }]
          })
        )
      })

      it('replaces empty comment thread in store', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.state.comment.commentThreads)
          .toContainEqual(expect.objectContaining({ authorId: 7, workflowId: 4, id: 1 }))
      })

      it('does not create workflow', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.dispatch).not.toHaveBeenCalledWith('workview/createWorkflow', expect.anything())
      })

      it('does not create workflow', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.dispatch).not.toHaveBeenCalledWith('workview/createWorkflow', item)
      })

      it('assigns stage', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        const stage = store.state.workview.datasetItems[0].current_workflow!.stages[1][0]
        expect(store.dispatch)
          .toHaveBeenCalledWith('workview/assignStage', { stage, userId: samMember.user_id })
      })
    })

    describe('assigned stage', () => {
      beforeEach(() => {
        sam = buildUserPayload({ id: 5 })
        store.commit('user/SET_PROFILE', sam)

        samMember = buildMembershipPayload({ id: 998, user_id: sam.id })
        store.commit('team/SET_MEMBERSHIPS', [samMember])

        const item = initializeARWorkflow({ current_workflow_id: 4 })
        const stage = item.current_workflow!.stages[1][0]
        stage.assignee_id = 5
        store.commit('workview/PUSH_DATASET_ITEMS', [item])
        store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
        store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
      })

      it('sends backend request', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(backend.createCommentThread).toHaveBeenCalledWith(
          expect.objectContaining({
            workflowId: 4,
            boundingBox: payload.bounding_box,
            comments: [{ body: 'foo' }]
          })
        )
      })

      it('replaces empty comment thread in store', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.state.comment.commentThreads)
          .toContainEqual(expect.objectContaining({ authorId: 7, workflowId: 4, id: 1 }))
      })

      it('does not create workflow', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.dispatch).not.toHaveBeenCalledWith('workview/createWorkflow', expect.anything())
      })

      it('does not create workflow', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        expect(store.dispatch).not.toHaveBeenCalledWith('workview/createWorkflow', item)
      })

      it('does not assign stage', async () => {
        await store.dispatch('comment/createCommentThread', thread)
        const stage = store.state.workview.datasetItems[0].current_workflow!.stages[1][0]
        expect(store.dispatch)
          .not.toHaveBeenCalledWith('workview/assignStage', { stage, member: samMember })
      })
    })
  })
})
