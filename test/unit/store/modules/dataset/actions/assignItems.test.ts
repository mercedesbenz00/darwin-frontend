import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildMembershipPayload,
  buildAxiosResponse,
  buildParsedError
} from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { assignItems } from '@/store/modules/dataset/actions/assignItems'
import { DatasetItemPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ assignItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

let datasetItems: DatasetItemPayload[]

const assignee = buildMembershipPayload({ id: 1, user_id: 3 })

const sfh = buildDatasetPayload({ id: 5 })

const ACTION = 'dataset/assignItems'

const payload: Parameters<typeof assignItems>[1] = {
  assignee,
  dataset: sfh,
  filter: { path: '/' }
}

beforeEach(() => {
  datasetItems = [
    initializeARWorkflow({ id: 1 }),
    initializeARWorkflow({ id: 2 })
  ]

  jest.spyOn(backend, 'assignItems').mockResolvedValue(buildAxiosResponse({ data: null }))

  store = createUnstubbedTestStore()
  store.commit('dataset/PUSH_DATASET_ITEMS', datasetItems)

  const { dispatch } = store

  const mockDispatch = jest.fn().mockImplementation((action, payload, opts) => {
    if (
      action.includes('loadDatasetItemCountsThrottled')
    ) {
      return Promise.resolve({ data: {} })
    } else {
      return dispatch(action, payload, opts)
    }
  })

  store.dispatch = mockDispatch
})

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  const backendPayload: Parameters<typeof backend.assignItems>[0] = {
    assigneeId: payload.assignee.user_id,
    filter: payload.filter,
    datasetId: payload.dataset.id
  }
  expect(backend.assignItems).toHaveBeenCalledWith(backendPayload)
})

it('returns error from backend', async () => {
  const error = buildParsedError({ message: 'foo' })
  jest.spyOn(backend, 'assignItems').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('pushes items to store when all selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', true)

  await store.dispatch(ACTION, payload)

  expect(store.state.dataset.datasetItems[0].current_workflow!.stages[1][0].assignee_id).toEqual(3)
  expect(store.state.dataset.datasetItems[1].current_workflow!.stages[1][0].assignee_id).toEqual(3)
})

it('pushes items to store when individual selected', async () => {
  store.commit('dataset/SET_SELECTED_ALL_ITEMS', false)
  store.commit('dataset/UPDATE_ITEM_SELECTION', { items: [datasetItems[0]], selected: true })

  await store.dispatch(ACTION, payload)
  expect(store.state.dataset.datasetItems[0].current_workflow!.stages[1][0].assignee_id).toEqual(3)
  expect(store.state.dataset.datasetItems[1].current_workflow!.stages[1][0].assignee_id).toBeNull()
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadDatasetItemCountsThrottled', { dataset: payload.dataset })
})
