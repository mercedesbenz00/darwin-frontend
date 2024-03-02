import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload
} from 'test/unit/factories'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { cancelV2StageAutoComplete } from './cancelV2StageAutoComplete'

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

const PAYLOAD: StoreActionPayload<typeof cancelV2StageAutoComplete> = undefined
const ACTION = 'workview/cancelV2StageAutoComplete'

const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })

const instance = buildV2WorkflowStageInstancePayload({
  item_id: 'foo',
  data: {
    exit_snapshot_id: null,
    skipped: false,
    active_edge: 'default',
    scheduled_to_complete_at: '2025-11-22 00:00:00'
  }
})

const itemState = buildV2WorkflowItemStatePayload({
  current_stage_instances: [instance]
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

it('throws if no stage instance', () => {
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('dispatches command', async () => {
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [{ data: {}, type: 'cancel' }],
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
