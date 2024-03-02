import { createLocalVue, shallowMount } from '@vue/test-utils'

import clickOutsideDirective from '@/directives/click-outside'

import { PopupMenuV2 } from '.'

const localVue = createLocalVue()
localVue.directive('click-outside', clickOutsideDirective)

it('matches snapshot', () => {
  const wrapper = shallowMount(PopupMenuV2, { localVue })
  expect(wrapper.find('.menu__container').exists()).toBe(true)
  expect(wrapper).toMatchSnapshot()
})

it('close emit click:outside when clicked outside', async () => {
  const wrapper = shallowMount(PopupMenuV2, { localVue })
  document.body.click()
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted()['click:outside']).toBeDefined()
  expect(wrapper).toMatchSnapshot()
})
