import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import TooltipInfo from '@/components/Common/TooltipInfo.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', () => {})

it('renders tooltip info', () => {
  const propsData = { content: 'a simple tooltip' }
  const wrapper = shallowMount(TooltipInfo, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
