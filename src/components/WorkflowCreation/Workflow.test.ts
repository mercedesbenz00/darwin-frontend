import { createTestingPinia } from '@pinia/testing'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import { PiniaVuePlugin } from 'pinia'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import Workflow from './Workflow.vue'

const localVue = createLocalVue()
localVue.use(Vuex) 
localVue.use(PiniaVuePlugin)

// extremely basic test setup and snapshot test, just so we have something
// the tests were never written in the inital implementation, so this just adds
// assurance the component renders in a basic setup

it('matches snapshot', () => {
  const pinia = createTestingPinia()
  const store = createTestStore()
  const propsData = { loading: false }
  const wrapper = shallowMount(Workflow, { localVue, pinia, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
