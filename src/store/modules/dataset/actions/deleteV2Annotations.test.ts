import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildParsedError,
  buildV2DARCWorkflow
} from 'test/unit/factories'

import * as backend from '@/utils/backend'

import { deleteV2Annotations } from './deleteV2Annotations'

jest.mock('@/utils/backend', () => ({
  deleteV2Annotations: jest.fn(),
  loadV2DatasetStatusCounts: jest.fn().mockImplementation(() => ({})),
  loadV2DatasetClassCounts: jest.fn().mockImplementation(() => ({})),
  loadV2DatasetGeneralCounts: jest.fn().mockImplementation(() => ({}))
}))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const workflow = buildV2DARCWorkflow()

const dataset = buildDatasetPayload({ id: 99 })

const ACTION = 'dataset/deleteV2Annotations'

const payload: Parameters<typeof deleteV2Annotations>[1] = {
  dataset,
  workflow,
  filters: { item_paths: ['/'] }
}

beforeEach(() => {
  jest.spyOn(backend, 'deleteV2Annotations').mockResolvedValue({ data: {} })

  store = createUnstubbedTestStore()

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
  const backendPayload: Parameters<typeof backend.deleteV2Annotations>[0] = {
    filters: { ...payload.filters, dataset_ids: [payload.dataset.id] },
    teamSlug: payload.dataset.team_slug,
    workflowId: payload.workflow.id
  }
  expect(backend.deleteV2Annotations).toHaveBeenCalledWith(backendPayload)
})

it('returns error from backend', async () => {
  const error = buildParsedError({ message: 'foo' })
  jest.spyOn(backend, 'deleteV2Annotations').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadV2DatasetItemCountsThrottled', {
    dataset
  })
})
