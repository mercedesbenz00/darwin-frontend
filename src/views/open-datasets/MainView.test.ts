import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetDetailPayload, buildDatasetPayload } from 'test/unit/factories'

import loadAndSelectDatasetDetails from '@/store/modules/dataset/actions/loadAndSelectDatasetDetails'
import loadDataset from '@/store/modules/workview/actions/loadDataset'
import { LoadingStatus, StoreActionPayload } from '@/store/types'
import MainView from '@/views/open-datasets/MainView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const sfhDataset = buildDatasetPayload({
  instructions: 'Instructions',
  name: 'Dataset',
  slug: 'sfh',
  team_slug: 'v7'
})

const sfhDetails = buildDatasetDetailPayload({ id: sfhDataset.id })

const mocks = {
  $route: {
    params: {
      datasetSlug: 'sfh',
      teamSlug: 'v7'
    }
  }
}

const stubs = { 'router-view': true }

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/SET_CURRENT_DATASET_DETAILS', sfhDetails)
  store.commit('workview/SET_DATASET', sfhDataset)
  store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loaded)
  store.commit('aclass/SET_TYPES_LOADING_STATUS', LoadingStatus.Loaded)
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(MainView, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('loads dataset', () => {
  shallowMount(MainView, { localVue, mocks, store, stubs })

  const payload: StoreActionPayload<typeof loadDataset> = {
    datasetSlug: sfhDataset.slug,
    teamSlug: sfhDataset.team_slug!
  }

  expect(store.dispatch).toHaveBeenCalledWith('workview/loadDataset', payload)
})

it('loads dataset details', async () => {
  // dataset loads first, then from the id contained within the response payload,
  // the details load
  store.dispatch = jest.fn().mockResolvedValue({ data: sfhDataset })

  shallowMount(MainView, { localVue, mocks, store, stubs })
  const payload: StoreActionPayload<typeof loadAndSelectDatasetDetails> = {
    dataset: sfhDataset
  }

  await flushPromises()
  expect(store.dispatch).toHaveBeenCalledWith('dataset/loadAndSelectDatasetDetails', payload)
})

describe('when classes not loaded', () => {
  beforeEach(() => {
    store.commit('aclass/SET_CLASSES_LOADING_STATUS', LoadingStatus.Loading)
  })

  itMatchesSnapshot()
})

describe('when types not loaded', () => {
  beforeEach(() => {
    store.commit('aclass/SET_TYPES_LOADING_STATUS', LoadingStatus.Loading)
  })

  itMatchesSnapshot()
})

describe('when dataset not loaded', () => {
  beforeEach(() => {
    store.commit('workview/SET_DATASET', null)
  })

  itMatchesSnapshot()
})

describe('when dataset details not loaded', () => {
  beforeEach(() => {
    store.commit('dataset/SET_CURRENT_DATASET_DETAILS', {})
  })

  itMatchesSnapshot()
})
