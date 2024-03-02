import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import ColorPicker from '@/components/Classes/ColorPicker/ColorPicker.vue'

const localVue = createLocalVue()

const colors = [
  'rgba(255, 0, 0, 1.0)',
  'rgba(0, 255, 0, 1.0)',
  'rgba(0, 0, 255, 1.0)'
]

const loadComponent = () => {
  const wrapper = shallowMount(ColorPicker, {
    localVue,
    propsData: {
      colors
    },
    mocks: {
      $theme: createMockTheme()
    }
  })
  return wrapper
}

it('matches snapshot', () => {
  const wrapper = loadComponent()
  expect(wrapper).toMatchSnapshot()
})

it('emit event when color is selected', () => {
  const wrapper = loadComponent()
  wrapper.findAll('color-variants-stub').at(0).vm.$emit('select', colors[0])
  expect(wrapper.emitted().select).toEqual([[colors[0]]])
})
