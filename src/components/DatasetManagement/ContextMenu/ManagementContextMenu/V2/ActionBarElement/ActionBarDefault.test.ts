import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import ActionBarDefault from './ActionBarDefault.vue'
import { ActionBarElement as Props } from './types'
const localVue = createLocalVue()
const propsData: Props = {
  active: false
}

const slots = {
  icon: 'icon-slot',
  default: 'default-slot',
  popover: 'popover-slot'
}

const ActionBarElement = localVue.extend({
  name: 'ActionBarElement',
  template: `
  <div data-stub="action-bar-element">
    <div data-slot="prefix"><slot name="prefixComp"/></div>
    <div data-slot="default"><slot /></div>
  </div>
  `
})

const stubs: Stubs = { ActionBarElement }

const itMatchesSnapshot = (): void =>
  it('matches snapshot', () => {
    const wrapper = shallowMount(ActionBarDefault, { localVue, propsData, slots, stubs })
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

describe('when inactive', () => {
  itMatchesSnapshot()

  describe('when disabled', () => {
    beforeEach(() => {
      propsData.disabled = 'This is disabled'
    })

    itMatchesSnapshot()
  })
})

describe('when active', () => {
  beforeEach(() => {
    propsData.active = true
  })

  itMatchesSnapshot()

  describe('when disabled', () => {
    beforeEach(() => {
      propsData.disabled = 'This is disabled'
    })

    itMatchesSnapshot()
  })
})

it('renders slots', () => {
  const wrapper = shallowMount(ActionBarDefault, { localVue, propsData, slots, stubs })
  expect(wrapper.text()).toContain('icon-slot')
  expect(wrapper.text()).toContain('default-slot')
  expect(wrapper.text()).toContain('popover-slot')
})
