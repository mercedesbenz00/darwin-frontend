import { createLocalVue, shallowMount } from '@vue/test-utils'

import SortButton from '@/components/Common/SortButton/V1/SortButton.vue'

const localVue = createLocalVue()

let propsData: { id?: string, direction?: number }

it('matches snapshot when inactive', () => {
  propsData = { direction: 0 }
  const wrapper = shallowMount(SortButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when ascending', () => {
  propsData = { direction: 1 }
  const wrapper = shallowMount(SortButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when descending', () => {
  propsData = { direction: 2 }
  const wrapper = shallowMount(SortButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits change event on button click with id', async () => {
  propsData = { id: 'sort', direction: 0 }
  const wrapper = shallowMount(SortButton, { localVue, propsData })
  await wrapper.find('.sort-button').trigger('click')
  expect(wrapper.emitted().change).toEqual([[{ id: 'sort', direction: 1 }]])
  expect(wrapper.emitted()['update:direction']).toEqual([[1]])
})
