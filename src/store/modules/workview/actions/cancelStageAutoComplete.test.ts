import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { cancelStageAutoComplete } from './cancelStageAutoComplete'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

jest.mock('@/utils/backend', () => ({ cancelStageAutoComplete: jest.fn() }))

const item = initializeARWorkflow()
item.current_workflow!.stages[1][0] = {
  ...item.current_workflow!.stages[1][0],
  completes_at: 1000
}
const autoCompleteStage = item.current_workflow!.stages[1][0]
const canceledStage = { ...item.current_workflow!.stages[1][0], completes_at: null }

beforeEach(() => {
  jest
    .spyOn(backend, 'cancelStageAutoComplete')
    .mockResolvedValue(buildAxiosResponse({ data: canceledStage }))
  store.commit('workview/SET_SELECTED_DATASET_ITEM', item)
})

afterEach(() => {
  (backend.cancelStageAutoComplete as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof cancelStageAutoComplete> = autoCompleteStage
const ACTION = 'workview/cancelStageAutoComplete'

it('sends request to backend', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  const expected: Parameters<typeof backend.cancelStageAutoComplete>[0] = {
    stageId: canceledStage.id
  }
  expect(backend.cancelStageAutoComplete).toHaveBeenCalledWith(expected)
})

it('cancels auto-completion', async () => {
  store.commit('workview/SCHEDULE_STAGE_AUTO_COMPLETE', [autoCompleteStage.id, 5])
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.scheduledStageAutoCompletions).toEqual([])
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
        1: [canceledStage]
      }
    }
  }])
})

it('replaces selected stage instance', async () => {
  store.commit('workview/PUSH_DATASET_ITEMS', [item])
  store.commit('workview/SET_SELECTED_STAGE_INSTANCE', autoCompleteStage)
  await store.dispatch(ACTION, PAYLOAD)
  expect(store.state.workview.selectedStageInstance).toEqual(canceledStage)
})

it('returns parsed error', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'cancelStageAutoComplete').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})
