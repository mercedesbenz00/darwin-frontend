import { createLocalVue, shallowMount } from '@vue/test-utils'

import SwitchGalleryLayout from '@/components/Common/Gallery/SwitchGalleryLayout.vue'
import { VIEW_MODE } from '@/components/Common/Gallery/types'

const localVue = createLocalVue()

it('matches snapshot when card mode', () => {
  const propsData = { value: VIEW_MODE.CARD }
  const wrapper = shallowMount(SwitchGalleryLayout, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when list mode', () => {
  const propsData = { value: VIEW_MODE.LIST }
  const wrapper = shallowMount(SwitchGalleryLayout, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits input/change event with new view mode on click', () => {
  const propsData = { value: VIEW_MODE.CARD }
  const wrapper = shallowMount(SwitchGalleryLayout, { localVue, propsData })
  wrapper.findAll('icon-button-stub').at(1).vm.$emit('click')
  expect(wrapper.emitted().input).toEqual([[VIEW_MODE.LIST]])
  expect(wrapper.emitted().change).toEqual([[VIEW_MODE.LIST]])
})
