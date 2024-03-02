import { createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'

import { getExportCompleteCount } from '@/store/modules/dataset/actions/getExportCompleteCount'
import { DatasetItemStatus, DatasetStatusCountsPayload, StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

const counts: DatasetStatusCountsPayload[] = [{ count: 2, status: DatasetItemStatus.complete }]

jest.mock('@/utils/backend', () => ({ loadDatasetStatusCounts: jest.fn() }))

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetStatusCounts').mockResolvedValue({ data: counts })
})

afterEach(() => {
  (backend.loadDatasetStatusCounts as jest.Mock).mockReset()
})

const payload: StoreActionPayload<typeof getExportCompleteCount> = {
  datasetSlug: 'sfh',
  teamSlug: 'v7'
}

it('sends request ', async () => {
  await store.dispatch('dataset/getExportCompleteCount', payload)
  expect(backend.loadDatasetStatusCounts).toHaveBeenCalledWith(expect.objectContaining({
    ...payload,
    statuses: [DatasetItemStatus.complete]
  }))
})

it('returns data as counts payload', async () => {
  const { data } = await store.dispatch('dataset/getExportCompleteCount', payload)
  expect(data).toEqual(counts)
})

it('pushes complete count to store', async () => {
  await store.dispatch('dataset/getExportCompleteCount', payload)
  await flushPromises()
  expect(store.state.dataset.exportCompleteCount).toEqual(2)
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetStatusCounts').mockResolvedValue({
    error: { message: 'foo', isValidationError: false }
  })
  const { error } = await store.dispatch('dataset/getExportCompleteCount', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
