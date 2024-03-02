import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  createUnstubbedTestStore,
  giveAnnotatorAbiliy,
  giveFullMemberAbility
} from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import { DatasetItemCountsPayload, DatasetItemStatus, DatasetItemType } from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH', slug: 'sfh', team_slug: 'v7' })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('workview/SET_DATASET', sfh)
  giveFullMemberAbility(store)
})

const counts: DatasetItemCountsPayload = {
  class_counts: [],
  commented_item_count: 0,
  item_count: 2,
  status_counts: [],
  unfiltered_item_count: 2
}

jest.mock('@/utils/backend', () => ({
  loadDatasetGeneralCounts: jest.fn(),
  loadDatasetClassCounts: jest.fn(),
  loadDatasetStatusCounts: jest.fn()
}))
jest.mock('@/utils/tutorialBackend', () => ({ loadDatasetItemCounts: jest.fn() }))

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetStatusCounts').mockResolvedValue({ data: [] })
  jest.spyOn(backend, 'loadDatasetClassCounts').mockResolvedValue({ data: [] })
  jest.spyOn(backend, 'loadDatasetGeneralCounts').mockResolvedValue({ data: counts })
  jest.spyOn(tutorialBackend, 'loadDatasetItemCounts').mockReturnValue({ data: counts })
})

afterEach(() => {
  (backend.loadDatasetClassCounts as jest.Mock).mockReset();
  (backend.loadDatasetGeneralCounts as jest.Mock).mockReset();
  (backend.loadDatasetStatusCounts as jest.Mock).mockReset();
  (tutorialBackend.loadDatasetItemCounts as jest.Mock).mockReset()
})

const expectedBase = {
  datasetSlug: 'sfh',
  teamSlug: 'v7',
  statuses: [
    DatasetItemStatus.new,
    DatasetItemStatus.annotate,
    DatasetItemStatus.review,
    DatasetItemStatus.complete
  ],
  types: [DatasetItemType.image, DatasetItemType.videoFrame, DatasetItemType.playbackVideo]
}

it('silently fails when no dataset set', async () => {
  store.commit('workview/RESET_ALL')
  const result = await store.dispatch('workview/loadDatasetItemCounts', { openWorkMode: false })
  expect(result).toEqual(undefined)
})

it('sends request ', async () => {
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(backend.loadDatasetGeneralCounts).toHaveBeenCalledWith({ ...expectedBase })
  expect(backend.loadDatasetClassCounts).toHaveBeenCalledWith({ ...expectedBase })
  expect(backend.loadDatasetStatusCounts).toHaveBeenCalledWith({ ...expectedBase })
})

it('calls tutorial if tutorial mode', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(backend.loadDatasetGeneralCounts).not.toHaveBeenCalled()
  expect(backend.loadDatasetClassCounts).not.toHaveBeenCalled()
  expect(backend.loadDatasetStatusCounts).not.toHaveBeenCalled()
  expect(tutorialBackend.loadDatasetItemCounts)
    .toHaveBeenCalledWith({ ...expectedBase, datasetId: 11 })
})

it('passes in stage template filters', async () => {
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
})

it('passes in stage status filters', async () => {
  const statuses = [DatasetItemStatus.new]
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses })
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(data).toEqual(counts)
})

it('pushes raw data to store', async () => {
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(store.state.workview.datasetItemCounts).toEqual(counts)
})

it('sanitizes filter when annotator', async () => {
  giveAnnotatorAbiliy(store)
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5 })
  expect(backend.loadDatasetGeneralCounts).toHaveBeenCalledWith({
    ...expectedBase,
    statuses: [DatasetItemStatus.annotate, DatasetItemStatus.review]
  })
})

it('not sanitize filter when annotator in open work mode', async () => {
  giveAnnotatorAbiliy(store)
  await store.dispatch('workview/loadDatasetItemCounts', { datasetId: 5, openWorkMode: true })
  expect(backend.loadDatasetGeneralCounts).toHaveBeenCalledWith({
    ...expectedBase,
    statuses: [DatasetItemStatus.new, DatasetItemStatus.annotate,
      DatasetItemStatus.review, DatasetItemStatus.complete]
  })
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetGeneralCounts').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('workview/loadDatasetItemCounts', { openWorkMode: false })
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
