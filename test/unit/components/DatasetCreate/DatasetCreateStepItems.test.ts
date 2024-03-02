import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import DatasetCreateStepItems from '@/components/DatasetCreate/DatasetCreateStepItems.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs: Stubs = ['dataset-create-step-item']
let store: ReturnType<typeof createTestStore>
beforeEach(() => {
  store = createTestStore()
})
it('matches the snapshot', () => {
  const propsData = { datasetId: 1 }
  const wrapper = shallowMount(
    DatasetCreateStepItems,
    {
      localVue,
      propsData,
      stubs,
      store,
      mocks: {
        $featureEnabled: () => true
      }
    }
  )
  expect(wrapper).toMatchSnapshot()
})
