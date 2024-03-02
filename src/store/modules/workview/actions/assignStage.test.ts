import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { assignStage } from './assignStage'

jest.mock('@/utils/backend', () => ({ assignStage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
const item = initializeARWorkflow()
const stage = item.current_workflow!.stages[1][0]
const assignedStage = {
  ...stage,
  assignee_id: 9
}

let mockDispatch: jest.Mock

beforeEach(() => {
  store = createUnstubbedTestStore()
  const { dispatch } = store

  mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('updateStageParents')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch

  jest
    .spyOn(backend, 'assignStage')
    .mockResolvedValue(buildAxiosResponse({ data: assignedStage }))

  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
})

afterEach(() => {
  (backend.assignStage as jest.Mock).mockReset()
  mockDispatch.mockClear()
})

const PAYLOAD: StoreActionPayload<typeof assignStage> = { stage, userId: 9 }
const ACTION = 'workview/assignStage'

it('sends request to backend', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.assignStage>[0] = {
    stageId: stage.id,
    userId: 9
  }
  expect(backend.assignStage).toHaveBeenCalledWith(expected)
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
        1: [assignedStage]
      }
    }
  }])
})

it('replaces selected stage instance', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.selectedStageInstance).toEqual(assignedStage)
})

it('returns parsed error', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'assignStage').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})

it('dispatches to update stage parents', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(mockDispatch).toHaveBeenLastCalledWith('workview/updateStageParents', assignedStage)
})
