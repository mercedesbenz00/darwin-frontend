import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetPayload } from 'test/unit/factories'

import OpenDatasetOverviewContent from '@/components/Dataset/OpenDatasetDetail/OpenDatasetOverviewContent.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  const dataset = buildDatasetPayload({
    id: 1,
    instructions: '<div>html content</div>'
  })
  store.commit('workview/SET_DATASET', dataset)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(OpenDatasetOverviewContent, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
