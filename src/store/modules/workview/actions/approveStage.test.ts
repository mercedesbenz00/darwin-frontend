import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { ReviewStatus, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { approveStage } from './approveStage'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const item = initializeARWorkflow()
const stage = item.current_workflow!.stages[2][0]
const approvedStage = {
  ...stage,
  metadata: { ...stage.metadata, review_status: ReviewStatus.Approved }
}

jest.mock('@/utils/backend', () => ({ setStageReviewStatus: jest.fn() }))

beforeEach(() => {
  jest
    .spyOn(backend, 'setStageReviewStatus')
    .mockResolvedValue(buildAxiosResponse({ data: approvedStage }))

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
})

afterEach(() => {
  (backend.setStageReviewStatus as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof approveStage> = stage
const ACTION = 'workview/approveStage'

it('sends request to backend', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.setStageReviewStatus>[0] = {
    stageId: stage.id,
    status: ReviewStatus.Approved
  }
  expect(backend.setStageReviewStatus).toHaveBeenCalledWith(expected)
})

it('pushes updated stage to store', async () => {
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.datasetItems).toEqual([{
    ...item,
    current_workflow: {
      ...item.current_workflow,
      stages: {
        ...item.current_workflow!.stages,
        2: [approvedStage]
      }
    }
  }])
})

it('replaces selected stage instance', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.selectedStageInstance).toEqual(approvedStage)
})

it('returns parsed error', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'setStageReviewStatus').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})

it('sets parsed error to store', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'setStageReviewStatus').mockResolvedValue({ error })
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.error).toEqual(error)
})
