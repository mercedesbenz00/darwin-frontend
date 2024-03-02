import { createLocalVue, shallowMount } from '@vue/test-utils'

import SwitchButton from '@/components/Common/SwitchButton.vue'

const localVue = createLocalVue()

let propsData: {
  value: boolean
}

it('matches snapshot when on', () => {
  propsData = {
    value: true
  }
  const wrapper = shallowMount(SwitchButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when off', () => {
  propsData = {
    value: false
  }
  const wrapper = shallowMount(SwitchButton, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emit input/change event on click', async () => {
  propsData = {
    value: false
  }
  const wrapper = shallowMount(SwitchButton, { localVue, propsData })
  wrapper.find('.switch-button').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper.emitted().input).toEqual([[true]])
  expect(wrapper.emitted().change).toEqual([[true]])
})
