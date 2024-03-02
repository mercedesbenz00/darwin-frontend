import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2WorkflowItemStatePayload,
  buildV2WorkflowStageInstancePayload,
  buildV2WorkflowStagePayload
} from 'test/unit/factories'

import { StageType, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { rejectV2ReviewStage } from './rejectV2ReviewStage'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock('@/utils/backend', () => ({ sendV2Commands: jest.fn() }))

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()

  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue({ data: { success: true } })
})

afterEach(() => {
  ;(backend.sendV2Commands as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof rejectV2ReviewStage> = undefined
const ACTION = 'workview/rejectV2ReviewStage'

const sfh = buildDatasetPayload({
  id: 1,
  slug: 'sfh',
  team_slug: 'v7'
})

const stage = buildV2WorkflowStagePayload({
  id: 'foo',
  name: 'Review',
  type: StageType.Review,
  edges: [
    {
      id: 'approve',
      source_stage_id: 'approve',
      target_stage_id: 'foo',
      name: 'approve'
    },
    {
      id: 'reject',
      source_stage_id: 'reject',
      target_stage_id: 'bar',
      name: 'reject'
    }
  ]
})

const instance = buildV2WorkflowStageInstancePayload({
  item_id: 'foo',
  stage
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

it('throws if no active review stage', () => {
  const notReview = {
    ...instance,
    stage: {
      ...instance.stage,
      type: StageType.Annotate
    }
  }
  const notReviewItem = {
    ...itemState,
    current_stage_instances: [notReview]
  }
  store.commit('workview/SET_V2_WORKFLOW_ITEM_STATE', notReviewItem)
  expect(store.dispatch(ACTION, PAYLOAD)).rejects.toThrow()
})

it('dispatches command', async () => {
  await store.dispatch(ACTION, PAYLOAD)

  const expected: Parameters<typeof backend.sendV2Commands>[0] = {
    commands: [
      expect.objectContaining({
        data: {
          delay_ms: 6000,
          stage_id: stage.id,
          edge: 'reject'
        },
        type: 'transition_via_edge'
      })
    ],
    datasetItemId: 'fake-item-id',
    teamSlug: 'v7'
  }

  expect(backend.sendV2Commands).toHaveBeenCalledWith(expected)
})

it('returns parsed error', async () => {
  const error = {
    message: 'foo',
    isValidationError: false
  }
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})

it('sets parsed error to store', async () => {
  const error = {
    message: 'foo',
    isValidationError: false
  }
  jest.spyOn(backend, 'sendV2Commands').mockResolvedValue({ error })
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.error).toEqual(error)
})
