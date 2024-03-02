import { createLocalVue, shallowMount } from '@vue/test-utils'

import ImageManipulator from '@/components/WorkView/ImageManipulation/Manipulators/components/ImageManipulator.vue'

const localVue = createLocalVue()

it('matches snapshot with full slots', () => {
  const slots = {
    label: 'Label slot',
    value: 'Value slot',
    others: 'Others slot',
    slider: 'Slider slot'
  }
  const wrapper = shallowMount(ImageManipulator, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot without value slot', () => {
  const slots = {
    label: 'Label slot',
    others: 'Others slot',
    slider: 'Slider slot'
  }
  const wrapper = shallowMount(ImageManipulator, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot without slider slot', () => {
  const slots = {
    label: 'Label slot',
    value: 'Value slot',
    others: 'Others slot'
  }
  const wrapper = shallowMount(ImageManipulator, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with refresh listener', () => {
  const slots = {
    label: 'Label slot'
  }
  const listeners = {
    refresh: () => {}
  }
  const wrapper = shallowMount(ImageManipulator, { localVue, listeners, slots })
  expect(wrapper).toMatchSnapshot()
})

it('emits refresh when refresh button is clicked', () => {
  const slots = {
    label: 'Label slot'
  }
  const listeners = {
    refresh: () => {}
  }
  const wrapper = shallowMount(ImageManipulator, { localVue, listeners, slots })
  wrapper.find('button').trigger('click')
  expect(wrapper.emitted().refresh).toHaveLength(1)
})
