import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildTeamPayload } from 'test/unit/factories'

import { DatasetItemCountsPayload, DatasetItemStatus } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH' })
const team = buildTeamPayload({})

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.state.team.currentTeam = team
  store.commit('dataset/SET_DATASETS', [sfh])
})

const counts: DatasetItemCountsPayload = {
  class_counts: [],
  item_count: 2,
  commented_item_count: 0,
  status_counts: [],
  unfiltered_item_count: 2
}

jest.mock('@/utils/backend', () => ({
  loadDatasetItemCounts: jest.fn(),
  loadDatasetStatusCounts: jest.fn(),
  loadDatasetGeneralCounts: jest.fn(),
  loadDatasetClassCounts: jest.fn()
}))

beforeEach(() => {
  jest.spyOn(backend, 'loadDatasetStatusCounts').mockResolvedValue({ data: [] })
  jest.spyOn(backend, 'loadDatasetGeneralCounts').mockResolvedValue({
    data: {
      item_count: 2,
      commented_item_count: 0,
      unfiltered_item_count: 2
    }
  })
  jest.spyOn(backend, 'loadDatasetClassCounts').mockResolvedValue({ data: [] })
})

afterEach(() => {
  jest.resetAllMocks()
})

it('sends request ', async () => {
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      datasetSlug: sfh.slug,
      teamSlug: sfh.team_slug
    })
  )
  expect(backend.loadDatasetClassCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      datasetSlug: sfh.slug,
      teamSlug: sfh.team_slug
    })
  )
  expect(backend.loadDatasetGeneralCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      datasetSlug: sfh.slug,
      teamSlug: sfh.team_slug
    })
  )
})

it('passes in stage template filters', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
})

it('passes in status filters', async () => {
  const statuses = [DatasetItemStatus.new]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { statuses })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
})

it('passes in class filters', async () => {
  // eslint-disable-next-line camelcase
  const annotation_class_ids = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { annotation_class_ids })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
})

it('passes in assignees', async () => {
  const assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { assignees })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
})

it('passes in current assignees', async () => {
  // eslint-disable-next-line camelcase
  const current_assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { current_assignees })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER', { path: '/foo' })
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(backend.loadDatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ path: '/foo' }))
  expect(backend.loadDatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ path: '/foo' }))
  expect(backend.loadDatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ path: '/foo' }))
})

it('returns data as detail payload', async () => {
  const { data } = await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(data).toEqual({ ...counts, id: sfh.id })
})

it('pushes data as detail payload to store', async () => {
  await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(store.state.dataset.datasetDetails).toEqual([{ ...counts, id: sfh.id }])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetGeneralCounts')
    .mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('dataset/loadDatasetItemCounts', { dataset: sfh })
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
