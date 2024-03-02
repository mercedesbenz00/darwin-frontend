import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildDatasetItemFilenamePayload,
  buildDatasetItemPayload,
  buildDatasetPayload,
  buildDatasetVideoPayload
} from 'test/unit/factories'

import {
  DatasetItemFilenamePayload,
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetItemType
} from '@/store/types'
import * as backend from '@/utils/backend/loadDatasetItems'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH' })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('dataset/SET_DATASETS', [sfh])
})

const datasetItems: DatasetItemPayload[] = [
  buildDatasetItemPayload({ id: 1, filename: '1.jpg' }),
  buildDatasetItemPayload({ id: 2, filename: '2.mpg', type: DatasetItemType.playbackVideo }),
  buildDatasetItemPayload({
    id: 3,
    filename: '3.dcm',
    type: DatasetItemType.playbackVideo,
    dataset_video: buildDatasetVideoPayload({
      metadata: { type: 'dicom' }
    })
  }),
  buildDatasetItemPayload({
    id: 4,
    filename: '4.pdf',
    type: DatasetItemType.playbackVideo,
    dataset_video: buildDatasetVideoPayload({
      metadata: { type: 'pdf' }
    })
  })
]
const filenames: DatasetItemFilenamePayload[] = [
  buildDatasetItemFilenamePayload({ filename: '1.jpg', type: DatasetItemType.image }),
  buildDatasetItemFilenamePayload({ filename: '2.mpg', type: DatasetItemType.playbackVideo }),
  buildDatasetItemFilenamePayload({
    filename: '3.dcm',
    type: DatasetItemType.playbackVideo,
    isDicom: true
  }),
  buildDatasetItemFilenamePayload({
    filename: '4.pdf',
    type: DatasetItemType.playbackVideo,
    isPdf: true
  })
]

jest.mock('@/utils/backend/loadDatasetItems', () => ({ loadDatasetItems: jest.fn() }))

beforeEach(() => {
  store.commit('dataset/SET_CURRENT_DATASET_ID', sfh.id)
  jest.spyOn(backend, 'loadDatasetItems').mockResolvedValue(buildAxiosResponse({
    data: {
      items: datasetItems,
      metadata: {}
    }
  }))
})

afterEach(() => {
  (backend.loadDatasetItems as jest.Mock).mockReset()
})

it('sends request ', async () => {
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems).toHaveBeenCalledWith(expect.objectContaining({
    datasetId: sfh.id,
    filename_contains: 'keyword'
  }))
})

it('passes in annotation_class_ids', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { annotation_class_ids: [1] })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids: [1] }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/folder1' })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ path: '/folder1' }))
})

it('passes in statuses', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses: [DatasetItemStatus.annotate] })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses: [DatasetItemStatus.annotate] }))
})

it('passes in types', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { types: [DatasetItemType.image] })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ types: [DatasetItemType.image] }))
})

it('passes in video_ids', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { video_ids: [1] })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ video_ids: [1] }))
})

it('passes in workflow_stage_template_ids', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1] })
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1] }))
})

it('returns data as string array', async () => {
  const { data } = await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(data).toEqual(filenames)
})

it('pushes data as string array to store', async () => {
  await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(store.state.dataset.datasetItemFilenames).toEqual(filenames)
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetItems').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('dataset/searchFilenames', { datasetId: sfh.id, search: 'keyword' })
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
