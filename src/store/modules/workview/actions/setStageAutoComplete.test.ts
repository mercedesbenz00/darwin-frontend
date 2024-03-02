import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { setStageAutoComplete } from './setStageAutoComplete'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

jest.mock('@/utils/backend', () => ({ setStageAutoComplete: jest.fn() }))

const item = initializeARWorkflow()
item.current_workflow!.stages[1][0] = {
  ...item.current_workflow!.stages[1][0],
  completes_at: null
}
const stage = item.current_workflow!.stages[1][0]
const autoCompleteStage = { ...item.current_workflow!.stages[1][0], completes_at: null }

beforeEach(() => {
  jest
    .spyOn(backend, 'setStageAutoComplete')
    .mockResolvedValue(buildAxiosResponse({ data: autoCompleteStage }))
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', stage)
})

afterEach(() => {
  (backend.setStageAutoComplete as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof setStageAutoComplete> = stage
const ACTION = 'workview/setStageAutoComplete'

it('sends request to backend', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.setStageAutoComplete>[0] = {
    stageId: stage.id
  }
  expect(backend.setStageAutoComplete).toHaveBeenCalledWith(expected)
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
        1: [autoCompleteStage]
      }
    }
  }])
})

it('replaces selected stage instance', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.selectedStageInstance).toEqual(autoCompleteStage)
})

it('returns parsed error', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'setStageAutoComplete').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})

it('stores error in state', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'setStageAutoComplete').mockResolvedValue({ error })
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.error).toEqual(error)
})
