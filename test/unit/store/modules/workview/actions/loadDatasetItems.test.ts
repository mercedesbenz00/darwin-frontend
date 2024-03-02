import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  createUnstubbedTestStore,
  giveAnnotatorAbiliy,
  giveFullMemberAbility
} from 'test/unit/createTestStore'
import { buildAxiosResponse, buildDatasetItemPayload } from 'test/unit/factories'

import { LoadDatasetItemsActionPayload } from '@/store/modules/workview/actions/loadDatasetItems'
import {
  DatasetItemStatus,
  DatasetItemType
} from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => { store = createUnstubbedTestStore() })

const item1 = buildDatasetItemPayload({ id: 1 })
const item2 = buildDatasetItemPayload({ id: 2 })

const items = [item1, item2]
const metadata = { previous: 'prev', next: 'next' }

jest.mock('@/utils/backend', () => ({ loadDatasetItems: jest.fn() }))
jest.mock('@/utils/tutorialBackend', () => ({ loadDatasetItems: jest.fn() }))

beforeEach(() => {
  jest
    .spyOn(backend, 'loadDatasetItems')
    .mockResolvedValue(buildAxiosResponse({ data: { items, metadata } }))

  jest
    .spyOn(tutorialBackend, 'loadDatasetItems')
    .mockReturnValue({ data: { items, metadata } })
})

afterEach(() => {
  (backend.loadDatasetItems as jest.Mock).mockReset();
  (tutorialBackend.loadDatasetItems as jest.Mock).mockReset()
})

const baseParams = {
  statuses: [
    DatasetItemStatus.new,
    DatasetItemStatus.annotate,
    DatasetItemStatus.review,
    DatasetItemStatus.complete
  ],
  types: [DatasetItemType.image, DatasetItemType.videoFrame, DatasetItemType.playbackVideo]
}

let actionPayload: LoadDatasetItemsActionPayload

beforeEach(() => {
  giveFullMemberAbility(store)
  actionPayload = {
    datasetId: 5,
    page: { size: 50 },
    openWorkMode: false
  }
})

it('sends request ', async () => {
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems).toHaveBeenCalledWith({
    ...baseParams,
    datasetId: 5,
    page: actionPayload.page
  })
})

it('sanitizes request when annotator ', async () => {
  giveAnnotatorAbiliy(store)
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems).toHaveBeenCalledWith({
    ...baseParams,
    statuses: [DatasetItemStatus.annotate, DatasetItemStatus.review],
    datasetId: 5,
    page: actionPayload.page
  })
})

it('not sanitize request when annotator in open work mode', async () => {
  giveAnnotatorAbiliy(store)
  await store.dispatch('workview/loadDatasetItems', { ...actionPayload, openWorkMode: true })
  expect(backend.loadDatasetItems).toHaveBeenCalledWith({
    ...baseParams,
    statuses: [DatasetItemStatus.new, DatasetItemStatus.annotate,
      DatasetItemStatus.review, DatasetItemStatus.complete],
    datasetId: 5,
    page: actionPayload.page
  })
})

it('calls tutorial if tutorial mode', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems).not.toHaveBeenCalled()
  expect(tutorialBackend.loadDatasetItems)
    .toHaveBeenCalledWith({
      ...baseParams,
      datasetId: 5,
      page: actionPayload.page
    })
})

it('passes in page params', async () => {
  actionPayload.page = { to: '50', size: 20 }

  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems).toHaveBeenCalledWith({
    ...baseParams,
    datasetId: 5,
    page: actionPayload.page
  })
})

it('passes in positive assigness filters', async () => {
  actionPayload.page = { from: '1', size: 20 }
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { current_assignees: [1] })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ current_assignees: [1] }))
})

it('passes in stage positive status filters', async () => {
  actionPayload.page = { from: '1', size: 20 }

  const statuses = [DatasetItemStatus.new]
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { statuses })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ statuses }))
})

it('passes in stage positive template filters', async () => {
  actionPayload.page = { to: '50', size: 20 }

  store.commit('workview/SET_DATASET_ITEMS_FILTER', { workflow_stage_template_ids: [1, 2] })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      workflow_stage_template_ids: [1, 2]
    }))
})

it('passes in negative assigness filters', async () => {
  actionPayload.page = { from: '1', size: 20 }
  const notCurrentAssignees = [1]
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { not_current_assignees: notCurrentAssignees })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ not_current_assignees: notCurrentAssignees }))
})

it('passes in stage negative status filters', async () => {
  actionPayload.page = { from: '1', size: 20 }

  const notStatuses = [DatasetItemStatus.new]
  store.commit('workview/SET_DATASET_ITEMS_FILTER', { not_statuses: notStatuses })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({ not_statuses: notStatuses }))
})

it('passes in stage negative template filters', async () => {
  actionPayload.page = { to: '50', size: 20 }

  store.commit('workview/SET_DATASET_ITEMS_FILTER', { not_workflow_stage_template_ids: [1, 2] })
  await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(backend.loadDatasetItems)
    .toHaveBeenCalledWith(expect.objectContaining({
      not_workflow_stage_template_ids: [1, 2]
    }))
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(data).toEqual({ items, metadata })
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(backend, 'loadDatasetItems').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('workview/loadDatasetItems', actionPayload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})

// TODO: Add tests for pagination calculation
