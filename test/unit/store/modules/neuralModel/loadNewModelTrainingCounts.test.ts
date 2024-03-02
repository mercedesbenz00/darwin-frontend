import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetItemsCountPayload, buildDatasetPayload } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import { DatasetItemStatus, DatasetItemType } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadDatasetGeneralCounts: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const sfh = buildDatasetPayload({ id: 5, slug: 'sfh', team_slug: 'v7' })
const counts = buildDatasetItemsCountPayload({ item_count: 1000 })

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetGeneralCounts').mockResolvedValue({ data: counts })
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
  store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
})

afterEach(() => {
  (backend.loadDatasetGeneralCounts as jest.Mock).mockReset()
})

const ACTION = 'neuralModel/loadNewModelTrainingCounts'

it('raises if no dataset selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', null)
  await expect(store.dispatch(ACTION)).rejects.toThrow()
})

it('raises if no classes selected', async () => {
  store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [])
  await expect(store.dispatch(ACTION)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch(ACTION)
  const expected: Parameters<typeof backend.loadDatasetGeneralCounts>[0] = {
    annotation_class_ids: [bottle.id, flask.id],
    datasetSlug: 'sfh',
    statuses: [DatasetItemStatus.complete],
    teamSlug: 'v7',
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame],
    unroll_videos: true
  }
  expect(backend.loadDatasetGeneralCounts).toHaveBeenNthCalledWith(1, expected)
})

it('returns raw data', async () => {
  const response = await store.dispatch(ACTION)
  expect(response).toEqual({ data: counts })
})

it('pushes response to state', async () => {
  await store.dispatch(ACTION)
  expect(store.state.neuralModel.newModelTrainingCounts).toEqual(1000)
})

it('returns parsed error on failure', async () => {
  (backend.loadDatasetGeneralCounts as jest.Mock).mockReset()
  jest.spyOn(backend, 'loadDatasetGeneralCounts').mockResolvedValue({
    error: { message: 'foo', isValidationError: false }
  })
  const { error } = await store.dispatch(ACTION)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
