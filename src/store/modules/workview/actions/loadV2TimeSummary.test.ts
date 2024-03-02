import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildV2DatasetItemPayload,
  buildV2DatasetItemTimeSummaryPayload,
  buildAxiosResponse
} from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadV2DatasetItemTimeSummary: jest.fn() }))

const summary = buildV2DatasetItemTimeSummaryPayload({ dataset_item_id: '1' })

const item = buildV2DatasetItemPayload({ id: '1' })

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
const dataset = buildDatasetPayload()
beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('workview/SET_DATASET', dataset)

  jest
    .spyOn(backend, 'loadV2DatasetItemTimeSummary')
    .mockResolvedValue(buildAxiosResponse({ data: summary }))
})

it('sends correct backend request', async () => {
  await store.dispatch('workview/loadV2TimeSummary', { teamSlug: dataset.team_slug, item })
  expect(backend.loadV2DatasetItemTimeSummary).toHaveBeenCalledWith(
    { datasetItemId: '1', teamSlug: dataset.team_slug }
  )
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('workview/loadV2TimeSummary', { teamSlug: dataset.team_slug, item })
  expect(data).toEqual(summary)
})

it('pushes raw data to store', async () => {
  await store.dispatch('workview/loadV2TimeSummary', { teamSlug: dataset.team_slug, item })
  expect(store.state.workview.v2DatasetItemTimeSummaries).toEqual({ [summary.dataset_item_id]: summary })
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadV2DatasetItemTimeSummary').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('workview/loadV2TimeSummary', { teamSlug: dataset.team_slug, item })

  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
