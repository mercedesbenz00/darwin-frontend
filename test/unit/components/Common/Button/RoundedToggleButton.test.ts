import { createLocalVue, shallowMount } from '@vue/test-utils'

import RoundedToggleButton from '@/components/Common/Button/V1/RoundedToggleButton.vue'

const localVue = createLocalVue()

let slots: { default: string, icon?: string }

beforeEach(() => {
  slots = {
    default: 'A message'
  }
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(RoundedToggleButton, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot()

it('renders slot', () => {
  const wrapper = shallowMount(RoundedToggleButton, { localVue, slots })
  expect(wrapper.text()).toContain(slots.default)
})

it('emits toggle', () => {
  const wrapper = shallowMount(RoundedToggleButton, { localVue, slots })
  wrapper.find('button').trigger('mousedown')
  expect(wrapper.emitted().toggle!.length).toEqual(1)
})

describe('when given icon slot', () => {
  beforeEach(() => {
    slots.icon = 'Foo'
  })

  itMatchesSnapshot()

  it('renders icon slot', () => {
    const wrapper = shallowMount(RoundedToggleButton, { localVue, slots })
    expect(wrapper.text()).toContain('Foo')
  })
})
