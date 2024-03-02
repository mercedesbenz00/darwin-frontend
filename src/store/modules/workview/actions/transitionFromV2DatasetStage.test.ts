import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildUserPayload,
  buildV2WorkflowStageInstancePayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import { StageType, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { transitionFromV2DatasetStage } from './transitionFromV2DatasetStage'

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

const PAYLOAD: StoreActionPayload<typeof transitionFromV2DatasetStage> = undefined
const ACTION = 'workview/transitionFromV2DatasetStage'

const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', team_slug: 'v7' })
const joe = buildUserPayload({ id: 11 })

const stage = buildV2WorkflowStagePayload({
  name: 'Dataset',
  type: StageType.Dataset,
  edges: [
    { id: 'default', source_stage_id: 'bar', target_stage_id: 'foo', name: 'default' }
  ]
})

const instance = buildV2WorkflowStageInstancePayload({ item_id: 'foo', stage })

beforeEach(() => {
  store.commit('workview/SET_DATASET', sfh)
  store.commit('workview/SET_V2_SELECTED_DATASET_ITEM', 'fake-item-id')
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', instance)
  store.commit('user/SET_PROFILE', joe)
})

it('throws if no selected dataset', () => {
  store.commit('workview/SET_DATASET', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('throws if no stage instance', () => {
  store.commit('workview/SET_V2_SELECTED_STAGE_INSTANCE', null)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('dispatches command', async () => {
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters< typeof backend.sendV2Commands>[0] = {
    commands: [
      expect.objectContaining({
        data: { stage_id: instance.stage_id, edge: 'default' },
        type: 'transition_via_edge'
      })
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
