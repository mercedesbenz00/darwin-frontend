import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { installCommonComponents } from '@/plugins/components'
import IndexView from '@/views/models/IndexView.vue'

const localVue = createLocalVue()
installCommonComponents(localVue)

const stubs: Stubs = ['router-link', 'router-view']

it('matches snapshot', () => {
  const wrapper = shallowMount(IndexView, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})
