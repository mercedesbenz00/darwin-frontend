import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import TypeSelection from '@/components/ModelCreation/TypeSelection.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TypeSelection, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})
