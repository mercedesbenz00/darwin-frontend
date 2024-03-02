import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildMembershipPayload,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { assignV2Stage } from './assignV2Stage'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock('@/utils/backend', () => ({ sendV2Commands: jest.fn() }))

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()

  jest
    .spyOn(backend, 'sendV2Commands')
    .mockResolvedValue({ data: { success: true } })
})

afterEach(() => {
  (backend.sendV2Commands as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof assignV2Stage> = {
  stage: buildV2WorkflowStagePayload({ name: 'FooStage' }),
  member: buildMembershipPayload({ user_id: 9 })
}
const ACTION = 'workview/assignV2Stage'

const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [
    buildV2WorkflowStageInstancePayload({
      stage: PAYLOAD.stage
    })
  ]
})

beforeEach(() => {
  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', 'fake-item-id')
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', itemState)
})

it('throws if no selected dataset', () => {
  store.commit('workview/SET_DATASET', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('throws if no item state', () => {
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('dispatches command', async () => {
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [
      expect.objectContaining({
        data: { stage_id: PAYLOAD.stage.id, assignee_id: PAYLOAD.member.user_id },
        type: 'assign'
      })
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }

  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('updates selected stage instance', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.v2SelectedStageInstance?.data.scheduled_to_complete_at).not.toBe(null)
})

it('returns parsed error', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})

it('sets parsed error to store', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue({ error })
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.error).toEqual(error)
})
