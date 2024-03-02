import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import OpenDatasetOverview from '@/views/open-datasets/OpenDatasetOverview.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const sfhDataset = buildDatasetPayload({
  instructions: 'Instructions',
  name: 'Dataset',
  slug: 'dataset',
  team_slug: 'v7'
})

const stubs: Stubs = {
  'open-dataset-detail-layout': DatasetDetailLayout
}

beforeEach(() => {
  store = createTestStore()
  store.commit('workview/SET_DATASET', sfhDataset)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(OpenDatasetOverview, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
