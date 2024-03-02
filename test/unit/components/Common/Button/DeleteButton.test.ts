import { createLocalVue, shallowMount } from '@vue/test-utils'

import DeleteButton from '@/components/Common/Button/V1/DeleteButton.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(DeleteButton, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('emits click', () => {
  const wrapper = shallowMount(DeleteButton, { localVue })
  wrapper.find('button').trigger('click')
  expect(wrapper.emitted().click!.length).toEqual(1)
})
