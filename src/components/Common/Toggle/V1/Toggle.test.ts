import { createLocalVue, shallowMount } from '@vue/test-utils'

import Toggle from './Toggle.vue'

const localVue = createLocalVue()

describe('when no label is provided', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Toggle, { localVue })

    expect(wrapper).toMatchSnapshot()
  })
})

describe('when a label is provided', () => {
  it('renders the label content', () => {
    const label = '<strong>Hello world!</strong>'
    const slots = { default: label }
    const wrapper = shallowMount(Toggle, { localVue, slots })

    expect(wrapper.html()).toContain(label)
  })

  it('matches snapshot', () => {
    const slots = { default: 'Test' }
    const wrapper = shallowMount(Toggle, { localVue, slots })

    expect(wrapper).toMatchSnapshot()
  })
})
