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
  loadV2DatasetItemCounts: jest.fn(),
  loadV2DatasetStatusCounts: jest.fn(),
  loadV2DatasetGeneralCounts: jest.fn(),
  loadV2DatasetClassCounts: jest.fn()
}))

beforeEach(() => {
  jest.spyOn(backend, 'loadV2DatasetStatusCounts').mockResolvedValue({
    data: {
      detailed_counts: [],
      simple_counts: []
    }
  })
  jest.spyOn(backend, 'loadV2DatasetGeneralCounts').mockResolvedValue({
    data: {
      simple_counts: [{
        filtered_item_count: 2,
        dataset_id: 0,
        unfiltered_item_count: 2
      }]
    }
  })
  jest.spyOn(backend, 'loadV2DatasetClassCounts').mockResolvedValue({
    data: {
      simple_counts: []
    }
  })
})

afterEach(() => {
  jest.resetAllMocks()
})

it('sends request ', async () => {
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      dataset_ids: [sfh.id],
      teamSlug: sfh.team_slug
    })
  )
  expect(backend.loadV2DatasetClassCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      dataset_ids: [sfh.id],
      teamSlug: sfh.team_slug
    })
  )
  expect(backend.loadV2DatasetGeneralCounts).toHaveBeenCalledWith(
    expect.objectContaining({
      dataset_ids: [sfh.id],
      teamSlug: sfh.team_slug
    })
  )
})

it('passes in stage template filters', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ workflow_stage_template_ids: [1, 2] }))
})

it('passes in status filters, only status counts should not use status as a filter', async () => {
  const statuses = [DatasetItemStatus.new]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { statuses })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({ statuses }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
})

it('passes in class filters', async () => {
  // eslint-disable-next-line camelcase
  const annotation_class_ids = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { annotation_class_ids })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ annotation_class_ids }))
})

it('passes in assignees', async () => {
  const assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { assignees })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ assignees }))
})

it('passes in current assignees', async () => {
  // eslint-disable-next-line camelcase
  const current_assignees = [1, 2]
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { current_assignees })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees }))
})

it('passes in path', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { items_path: ['/foo'] })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ items_path: ['/foo'] }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ items_path: ['/foo'] }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.objectContaining({ items_path: ['/foo'] }))
})

it('excludes types when send request', async () => {
  store.commit('dataset/SET_FOLDER_ENABLED', true)
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', { types: ['image'], not_types: ['pdf'] })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({ types: ['image'], not_types: ['pdf'] }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({ types: ['image'], not_types: ['pdf'] }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({ types: ['image'], not_types: ['pdf'] }))
})

it('excludes unnecessary filter params', async () => {
  store.commit('dataset/SET_DATASET_ITEMS_FILTER_V2', {
    include_thumbnails: true, include_workflow_data: true
  })
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(backend.loadV2DatasetStatusCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({
      include_thumbnails: true, include_workflow_data: true
    }))
  expect(backend.loadV2DatasetClassCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({
      include_thumbnails: true, include_workflow_data: true
    }))
  expect(backend.loadV2DatasetGeneralCounts)
    .toHaveBeenCalledWith(expect.not.objectContaining({
      include_thumbnails: true, include_workflow_data: true
    }))
})

it('returns data as detail payload', async () => {
  const { data } = await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(data).toEqual({ ...counts, id: sfh.id })
})

it('pushes data as detail payload to store', async () => {
  await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(store.state.dataset.datasetDetails).toEqual([{ ...counts, id: sfh.id }])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadV2DatasetGeneralCounts')
    .mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('dataset/loadV2DatasetItemCounts', { dataset: sfh })
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
