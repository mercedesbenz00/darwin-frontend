import { createLocalVue, shallowMount } from '@vue/test-utils'

import QuickAdd from '@/components/Classes/AnnotationClassDialog/components/QuickAdd.vue'

const localVue = createLocalVue()

let propsData: {
  disabled: boolean
}

it('matches snapshot', () => {
  const wrapper = shallowMount(QuickAdd, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData = {
    disabled: true
  }
  const wrapper = shallowMount(QuickAdd, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('emits click event', () => {
  const wrapper = shallowMount(QuickAdd, { localVue, propsData })
  wrapper.find('.quick-add__clicker').trigger('click')
  expect(wrapper.emitted().click).toBeDefined()
})
