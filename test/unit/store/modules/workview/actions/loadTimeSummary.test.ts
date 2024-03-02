import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemPayload, buildDatasetItemTimeSummaryPayload, buildAxiosResponse } from 'test/unit/factories'

import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

jest.mock('@/utils/backend', () => ({ loadDatasetItemTimeSummary: jest.fn() }))
jest.mock('@/utils/tutorialBackend', () => ({ loadDatasetItemTimeSummary: jest.fn() }))

const summary = buildDatasetItemTimeSummaryPayload({ dataset_item_id: 1 })

const item = buildDatasetItemPayload({ id: 1 })

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()

  jest
    .spyOn(backend, 'loadDatasetItemTimeSummary')
    .mockResolvedValue(buildAxiosResponse({ data: summary }))

  jest
    .spyOn(tutorialBackend, 'loadDatasetItemTimeSummary')
    .mockReturnValue({ data: summary })
})

it('sends correct backend request', async () => {
  await store.dispatch('workview/loadTimeSummary', item)
  expect(backend.loadDatasetItemTimeSummary).toHaveBeenCalledWith({ datasetItemId: 1 })
})

it('sends request to tutorial backend', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('workview/loadTimeSummary', item)
  expect(tutorialBackend.loadDatasetItemTimeSummary).toHaveBeenCalledWith(item)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('workview/loadTimeSummary', item)
  expect(data).toEqual(summary)
})

it('pushes raw data to store', async () => {
  await store.dispatch('workview/loadTimeSummary', item)
  expect(store.state.workview.datasetItemTimeSummaries).toEqual([summary])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetItemTimeSummary').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('workview/loadTimeSummary', item)

  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
