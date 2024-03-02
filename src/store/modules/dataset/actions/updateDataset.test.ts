import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildDatasetPayload, buildAxiosResponse } from 'test/unit/factories'

import updateDataset from '@/store/modules/dataset/actions/updateDataset'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'
import * as tutorialBackend from '@/utils/tutorialBackend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const sfh = buildDatasetPayload({ id: 11, name: 'SFH' })

jest.mock('@/utils/backend', () => ({ updateDataset: jest.fn() }))
jest.mock('@/utils/tutorialBackend', () => ({ updateDataset: jest.fn() }))

let payload: StoreActionPayload<typeof updateDataset>

beforeEach(() => {
  store = createUnstubbedTestStore()
  payload = {
    dataset: sfh,
    params: {}
  }
  jest.spyOn(backend, 'updateDataset').mockResolvedValue(buildAxiosResponse({ data: sfh }))
  jest.spyOn(tutorialBackend, 'updateDataset').mockResolvedValue({ data: sfh } as never)
})

afterEach(() => {
  (backend.updateDataset as jest.Mock).mockReset()
})

it('sends request to api', async () => {
  await store.dispatch('dataset/updateDataset', payload)
  expect(backend.updateDataset).toHaveBeenCalledWith({ ...payload.params, datasetId: sfh.id })
})

it('passes all optional params to api', async () => {
  payload.params = {
    annotators: [],
    annotationHotkeys: { 1: 'select_class:1' },
    annotatorsCanCreateTags: true,
    annotatorsCanInstantiateWorkflows: true,
    anyoneCanDoubleAssign: true,
    instructions: 'fake instructions',
    name: 'fake name',
    pdfFitPage: true,
    public: true,
    reviewersCanAnnotate: true,
    workforceManagers: [],
    workPrioritization: 'inserted_at:desc',
    workSize: 55

  }
  await store.dispatch('dataset/updateDataset', payload)
  expect(backend.updateDataset)
    .toHaveBeenCalledWith({ ...payload.params, datasetId: sfh.id })
})

it('returns data retrieved from endpoint', async () => {
  const { data } = await store.dispatch('dataset/updateDataset', payload)
  expect(data).toEqual(sfh)
})

it('calls tutorial if tutorial mode', async () => {
  store.commit('workview/SET_TUTORIAL_MODE', true)
  await store.dispatch('dataset/updateDataset', payload)
  expect(backend.updateDataset).not.toHaveBeenCalled()
  expect(tutorialBackend.updateDataset)
    .toHaveBeenCalledWith({ ...payload.params, datasetId: sfh.id })
})

it('commits dataset to store', async () => {
  await store.dispatch('dataset/updateDataset', payload)
  expect(store.state.dataset.datasets).toEqual([sfh])
})

it('returns error', async () => {
  jest.spyOn(backend, 'updateDataset').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const response = await store.dispatch('dataset/updateDataset', payload)
  expect(response.error).toEqual({ message: 'foo', isValidationError: false })
})
