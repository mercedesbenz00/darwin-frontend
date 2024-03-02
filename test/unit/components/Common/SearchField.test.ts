import { createLocalVue, shallowMount } from '@vue/test-utils'

import SearchField from '@/components/Common/SearchField.vue'

const localVue = createLocalVue()

it('matches snapshot with default props', () => {
  const propsData = { value: '' }
  const wrapper = shallowMount(SearchField, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with custom props', () => {
  const propsData = {
    value: 'search-value',
    placeholder: 'Search Test...'
  }
  const wrapper = shallowMount(SearchField, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})
