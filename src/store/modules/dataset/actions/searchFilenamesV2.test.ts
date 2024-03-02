import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetItemFilenamePayload,
  buildV2DatasetItemPayload,
  buildDatasetPayload
} from 'test/unit/factories'

import {
  DatasetItemFilenamePayload,
  V2DatasetItemPayload,
  DatasetItemStatus,
  DatasetItemType
} from '@/store/types'
import * as backend from '@/utils/backend/loadV2DatasetItems'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH', team_slug: 'test' })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('dataset/SET_DATASETS', [sfh])
})

const datasetItems: V2DatasetItemPayload[] = [
  buildV2DatasetItemPayload({ id: '1', name: '1.jpg' }),
  buildV2DatasetItemPayload({ 
    id: '2', 
    name: '2.mpg', 
    slot_types: [DatasetItemType.playbackVideo] 
  }),
  buildV2DatasetItemPayload({
    id: '3',
    name: '3.dcm',
    slot_types: [DatasetItemType.dicom]
  }),
  buildV2DatasetItemPayload({
    id: '4',
    name: '4.pdf',
    slot_types: [DatasetItemType.pdf]
  })
]
const filenames: DatasetItemFilenamePayload[] = [
  buildDatasetItemFilenamePayload({ filename: '1.jpg', type: DatasetItemType.image }),
  buildDatasetItemFilenamePayload({ filename: '2.mpg', type: DatasetItemType.playbackVideo }),
  buildDatasetItemFilenamePayload({
    filename: '3.dcm',
    type: DatasetItemType.dicom,
    isDicom: true
  }),
  buildDatasetItemFilenamePayload({
    filename: '4.pdf',
    type: DatasetItemType.pdf,
    isPdf: true
  })
]

jest.mock('@/utils/backend/loadV2DatasetItems', () => ({ loadV2DatasetItems: jest.fn() }))

beforeEach(() => {
  store.commit('dataset/SET_CURRENT_DATASET_ID', sfh.id)
  jest.spyOn(backend, 'loadV2DatasetItems').mockResolvedValue(buildAxiosResponse({
    data: {
      items: datasetItems,
      metadata: {},
      page: {
        count: 4
      }
    }
  }))
})

afterEach(() => {
  (backend.loadV2DatasetItems as jest.Mock).mockReset()
})

const ACTION = 'dataset/searchFilenamesV2'

it('sends request ', async () => {
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems).toHaveBeenCalledWith(expect.objectContaining({
    dataset_ids: [sfh.id],
    item_name_contains: 'keyword'
  }))
})

it('passes in annotation_class_ids', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { annotation_class_ids: [1] })
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids: [1] }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { item_paths: ['/folder1'] })
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ item_paths: ['/folder1'] }))
})

it('passes in statuses', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { statuses: [DatasetItemStatus.annotate] })
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses: [DatasetItemStatus.annotate] }))
})

it('passes in types', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { types: [DatasetItemType.image] })
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ types: [DatasetItemType.image] }))
})

it('passes in workflow_stage_ids', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { workflow_stage_ids: [1] })
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(backend.loadV2DatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_ids: [1] }))
})

it('returns data as string array', async () => {
  const { data } = 
    await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(data).toEqual(filenames)
})

it('pushes data as string array to store', async () => {
  await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  expect(store.state.dataset.datasetItemFilenames).toEqual(filenames)
})

it('responds with parsed error on failure', async () => {
  jest
    .spyOn(backend, 'loadV2DatasetItems')
    .mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = 
    await store.dispatch(ACTION, { datasetId: sfh.id, search: 'keyword', teamSlug: 'test' })
  
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
