import { createLocalVue, shallowMount } from '@vue/test-utils'

import TrashButton from '@/components/WorkView/LayerBar/LayerBarItem/TrashButton.vue'

const localVue = createLocalVue()

it('matches snapshot', () => {
  const wrapper = shallowMount(TrashButton, { localVue })
  expect(wrapper).toMatchSnapshot()
})

it('emits click when clicked', async () => {
  const wrapper = shallowMount(TrashButton, { localVue })
  await wrapper.trigger('click')
  expect(wrapper.emitted().click).toHaveLength(1)
})
