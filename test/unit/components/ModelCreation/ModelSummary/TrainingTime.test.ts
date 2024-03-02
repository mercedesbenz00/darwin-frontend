import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemsCountPayload
} from 'test/unit/factories'

import TrainingTime from '@/components/ModelCreation/ModelSummary/TrainingTime.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  const counts = buildDatasetItemsCountPayload({ item_count: 5001 })
  store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TrainingTime, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders correct estimates', () => {
  const wrapper = shallowMount(TrainingTime, { localVue, store })
  expect(wrapper.text()).toContain('6 hours')
})
