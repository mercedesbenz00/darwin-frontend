import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { installCommonComponents } from '@/plugins/components'
import ErrorPage from '@/views/error/ErrorPage.vue'

const localVue = createLocalVue()
installCommonComponents(localVue)

it('matches snapshot', () => {
  const stubs: Stubs = { background: true, logo: true }
  const wrapper = shallowMount(ErrorPage, { localVue, stubs })
  expect(wrapper).toMatchSnapshot()
})
