import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import Tabs from '@/components/Common/Tabs/Tabs.vue'
import { Tab } from '@/components/Common/Tabs/types'

const localVue = createLocalVue()
const stubs: Stubs = { 'router-link': true }

it('matches snapshot', () => {
  const tabs: Tab[] = [
    { name: 'Tab1', to: '/tab1' },
    { name: 'Tab2', coming: true },
    { name: 'Tab3', to: '/tab3', exact: true }
  ]
  const propsData = { tabs }
  const wrapper = shallowMount(Tabs, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
