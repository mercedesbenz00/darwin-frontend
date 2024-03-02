import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetItemPayload, buildDatasetPayload } from 'test/unit/factories'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadDatasetItems: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 5 })

const items = [
  buildDatasetItemPayload({ id: 1, dataset_id: sfh.id }),
  buildDatasetItemPayload({ id: 2, dataset_id: sfh.id }),
  buildDatasetItemPayload({ id: 3, dataset_id: sfh.id })
]

const page1Response = buildAxiosResponse({
  data: { items: [items[0], items[1]], metadata: { next: '3', previous: 2 } }
})

const page2Response = buildAxiosResponse({
  data: { items: [items[2]], metadata: { next: null, previous: '3' } }
})

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
  jest.spyOn(backend, 'loadDatasetItems')
    .mockResolvedValueOnce(page1Response)
    .mockResolvedValue(page2Response)
})

afterEach(() => {
  (backend.loadDatasetItems as jest.Mock).mockReset()
})

const ACTION = 'neuralModel/loadSampleDatasetItems'

it('raises if no dataset selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', null)
  await expect(store.dispatch(ACTION)).rejects.toThrow()
})

it('sends paginated request', async () => {
  await store.dispatch(ACTION)

  const expected1: Parameters<typeof backend.loadDatasetItems>[0] = {
    datasetId: sfh.id,
    page: { from: undefined, size: 20 },
    statuses: [DatasetItemStatus.complete],
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame]
  }
  expect(backend.loadDatasetItems).toHaveBeenNthCalledWith(1, expected1)

  await store.dispatch(ACTION)

  const expected2: Parameters<typeof backend.loadDatasetItems>[0] = {
    datasetId: sfh.id,
    page: { from: '3', size: 20 },
    statuses: [DatasetItemStatus.complete],
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame]
  }
  expect(backend.loadDatasetItems).toHaveBeenNthCalledWith(2, expected2)
})

it('returns raw data', async () => {
  const response = await store.dispatch(ACTION)
  expect(response).toEqual(page1Response)
})

it('pushes response to state', async () => {
  await store.dispatch(ACTION)
  expect(store.state.neuralModel.newModelSampleItems).toEqual(page1Response.data.items)
  expect(store.state.neuralModel.newModelSampleItemsCursor).toEqual('3')

  await store.dispatch(ACTION)
  expect(store.state.neuralModel.newModelSampleItems).toEqual(items)
  expect(store.state.neuralModel.newModelSampleItemsCursor).toEqual(null)
})

it('returns parsed error on failure', async () => {
  (backend.loadDatasetItems as jest.Mock).mockReset()
  jest.spyOn(backend, 'loadDatasetItems').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch(ACTION)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
