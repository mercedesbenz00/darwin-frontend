import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildMembershipPayload,
  buildAxiosResponse,
  buildParsedError,
  buildV2DARCWorkflow
} from 'test/unit/factories'

import { assignV2Items } from '@/store/modules/dataset/actions/assignV2Items'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  assignV2Items: jest.fn(),
  loadV2DatasetStatusCounts: jest.fn().mockImplementation(() => ({})),
  loadV2DatasetClassCounts: jest.fn().mockImplementation(() => ({})),
  loadV2DatasetGeneralCounts: jest.fn().mockImplementation(() => ({}))
}))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const workflow = buildV2DARCWorkflow()

const dataset = buildDatasetPayload({ id: 99 })

const assignee = buildMembershipPayload({ id: 1, user_id: 3 })

const ACTION = 'dataset/assignV2Items'

const payload: Parameters<typeof assignV2Items>[1] = {
  assignee,
  dataset,
  workflow,
  filters: { item_paths: ['/'] }
}

beforeEach(() => {
  jest.spyOn(backend, 'assignV2Items').mockResolvedValue(buildAxiosResponse({ data: null }))

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
  const backendPayload: Parameters<typeof backend.assignV2Items>[0] = {
    assigneeId: payload.assignee.user_id,
    workflowId: payload.workflow.id,
    filters: { ...payload.filters, dataset_ids: [payload.dataset.id] },
    teamSlug: payload.dataset.team_slug
  }
  expect(backend.assignV2Items).toHaveBeenCalledWith(backendPayload)
})

it('returns error from backend', async () => {
  const error = buildParsedError({ message: 'foo' })
  jest.spyOn(backend, 'assignV2Items').mockResolvedValue(error)
  const response = await store.dispatch(ACTION, payload)
  expect(response.error.message).toEqual('foo')
})

it('loads item counts after successful response', async () => {
  await store.dispatch(ACTION, payload)
  expect(store.dispatch).toBeCalledWith('dataset/loadV2DatasetItemCountsThrottled', {
    dataset: dataset
  })
})
