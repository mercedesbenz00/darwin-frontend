import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload } from 'test/unit/factories'
import { initializeARWorkflow } from 'test/unit/factories/helpers'

import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

import { createWorkflow } from './createWorkflow'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const item = buildDatasetItemPayload({ id: 1, current_workflow: null })
const itemWithWorkflow = initializeARWorkflow(item)

jest.mock('@/utils/backend', () => ({ createWorkflow: jest.fn() }))

beforeEach(() => {
  jest
    .spyOn(backend, 'createWorkflow')
    .mockResolvedValue({ data: itemWithWorkflow })
})

afterEach(() => {
  (backend.createWorkflow as jest.Mock).mockReset()
})

const PAYLOAD: StoreActionPayload<typeof createWorkflow> = item
const ACTION = 'workview/createWorkflow'

it('sends request ', async () => {
  await store.dispatch(ACTION, PAYLOAD)
  expect(backend.createWorkflow).toHaveBeenCalledWith({
    datasetItemId: item.id
  })
})

it('returns raw data', async () => {
  const { data } = await store.dispatch(ACTION, PAYLOAD)
  expect(data).toEqual(itemWithWorkflow)
})

it('responds with parsed error on failure', async () => {
  const error = { message: 'foo', isValidationError: false }
  jest.spyOn(backend, 'createWorkflow').mockResolvedValue({ error })
  const response = await store.dispatch(ACTION, PAYLOAD)
  expect(response.error).toEqual(error)
})
