import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetReportPayload, buildAxiosResponse } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadDatasetReport: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const report = buildDatasetReportPayload({ id: 1 })

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetReport').mockResolvedValue(buildAxiosResponse({ data: report }))
})

afterEach(() => {
  (backend.loadDatasetReport as jest.Mock).mockReset()
})

it('calls correct backend endpoint', async () => {
  await store.dispatch('dataset/getReport', { datasetId: 1 })
  expect(backend.loadDatasetReport).toHaveBeenCalledWith({ datasetId: 1 })
})

it('commits report to store', async () => {
  await store.dispatch('dataset/getReport', { datasetId: 1 })
  expect(store.state.dataset.reports).toEqual([report])
})

it('returns parsed error on error', async () => {
  jest.spyOn(backend, 'loadDatasetReport').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('dataset/getReport', { datasetId: 1 })
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
