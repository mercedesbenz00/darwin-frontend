import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetPayload, buildDatasetReportPayload } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadDatasetReport: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const sfh = buildDatasetPayload({ id: 5 })
const report = buildDatasetReportPayload({ })

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetReport')
    .mockResolvedValue(buildAxiosResponse({ data: report }))
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
  store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
})

afterEach(() => {
  (backend.loadDatasetReport as jest.Mock).mockReset()
})

const ACTION = 'neuralModel/loadNewModelClassCounts'

it('raises if no dataset selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', null)
  await expect(store.dispatch(ACTION)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch(ACTION)
  const expected: Parameters<typeof backend.loadDatasetReport>[0] = {
    datasetId: sfh.id,
    statuses: [DatasetItemStatus.complete],
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame]
  }
  expect(backend.loadDatasetReport).toHaveBeenNthCalledWith(1, expected)
})

it('returns raw data', async () => {
  const response = await store.dispatch(ACTION)
  expect(response.data).toEqual(report)
})

it('pushes response to state', async () => {
  await store.dispatch(ACTION)
  expect(store.state.neuralModel.newModelClassCounts).toEqual(report)
})

it('returns parsed error on failure', async () => {
  (backend.loadDatasetReport as jest.Mock).mockReset()
  jest.spyOn(backend, 'loadDatasetReport').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch(ACTION)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
