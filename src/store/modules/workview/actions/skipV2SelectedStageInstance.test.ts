import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildUserPayload,
  buildV2DARCWorkflow,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { skipV2SelectedStageInstance } from './skipV2SelectedStageInstance'

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

const PAYLOAD: StoreActionPayload<typeof skipV2SelectedStageInstance> = 'Motion Blur'
const ACTION = 'workview/skipV2SelectedStageInstance'

const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
const joe = buildUserPayload({ id: 70 })
const workflow = buildV2DARCWorkflow()

const instance = buildV2WorkflowStageInstancePayload({
  item_id: 'foo',
  stage: workflow.stages[1],
  user_id: 5
})

beforeEach(() => {
  store.commit('user/SET_PROFILE', joe)
  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', 'fake-item-id')
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
})

it('throws if no selected dataset', () => {
  store.commit('workview/SET_DATASET', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('throws if no selected instance', () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('dispatches command', async () => {
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [
      {
        data: { reason: 'Motion Blur', stage_id: instance.stage_id },
        type: 'skip'
      },
      {
        data: { delay_ms: 6000, stage_id: instance.stage_id, edge: 'approve' },
        type: 'transition_via_edge'
      }
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }

  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('also dispatches assign command if instance unassigned', async () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', { ...instance, user_id: null })
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [
      expect.objectContaining({
        data: { assignee_id: joe.id, stage_id: instance.stage_id },
        type: 'assign'
      }),
      {
        data: { reason: 'Motion Blur', stage_id: instance.stage_id },
        type: 'skip'
      },
      {
        data: { delay_ms: 6000, stage_id: instance.stage_id, edge: 'approve' },
        type: 'transition_via_edge'
      }
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }

  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('also dispatches transition command, if review instance', async () => {
  const instance = buildV2WorkflowStageInstancePayload({
    item_id: 'foo',
    stage: workflow.stages[2],
    user_id: 5
  })
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)

  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [
      {
        data: { reason: 'Motion Blur', stage_id: instance.stage_id },
        type: 'skip'
      },
      {
        data: { delay_ms: 6000, stage_id: instance.stage_id, edge: 'approve' },
        type: 'transition_via_edge'
      }
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }

  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
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
