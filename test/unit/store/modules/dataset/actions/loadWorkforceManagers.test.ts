import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildWorkforceManagerPayload, buildAxiosResponse } from 'test/unit/factories'

import loadWorkforceManagers from '@/store/modules/dataset/actions/loadWorkforceManagers'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH' })

beforeEach(() => {
  store = createUnstubbedTestStore()
})

const managers = [buildWorkforceManagerPayload({ dataset_id: sfh.id })]

jest.mock('@/utils/backend', () => ({ loadWorkforceManagers: jest.fn() }))

beforeEach(() => {
  jest.spyOn(backend, 'loadWorkforceManagers').mockResolvedValue(buildAxiosResponse({ data: managers }))
})

afterEach(() => {
  (backend.loadWorkforceManagers as jest.Mock).mockReset()
})

const payload: StoreActionPayload<typeof loadWorkforceManagers> = sfh
const params: Parameters<typeof backend.loadWorkforceManagers>[0] = { datasetId: sfh.id }

it('sends request ', async () => {
  await store.dispatch('dataset/loadWorkforceManagers', payload)
  expect(backend.loadWorkforceManagers).toHaveBeenCalledWith(params)
})

it('returns data', async () => {
  const { data } = await store.dispatch('dataset/loadWorkforceManagers', payload)
  expect(data).toEqual(managers)
})

it('pushes data as detail payload to store', async () => {
  await store.dispatch('dataset/loadWorkforceManagers', payload)
  expect(store.state.dataset.workforceManagers).toEqual(managers)
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadWorkforceManagers').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('dataset/loadWorkforceManagers', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
