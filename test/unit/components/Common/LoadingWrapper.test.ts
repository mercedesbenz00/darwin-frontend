import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import LoadingWrapper from '@/components/Common/LoadingWrapper.vue'
import loadingDirective from '@/directives/loading'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

it('matches snapshot when loading', () => {
  const propsData = { loading: true }
  const slots = { default: '<div>Data slot</div>' }
  const wrapper = shallowMount(LoadingWrapper, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when loaded', () => {
  const propsData = { loading: false }
  const slots = { default: '<div>Data slot</div>' }
  const wrapper = shallowMount(LoadingWrapper, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})
