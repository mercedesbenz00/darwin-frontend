import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ActionBarRestore from './ActionBarRestore.vue'

let wrapper: Wrapper<Vue>

const propsData: { disabled: null | string, active: boolean } = {
  active: false,
  disabled: null
}

const itMatchesSnapshot = (): void =>
  it('matches snapshot', () => {
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

describe('is inactive', () => {
  beforeEach(() => {
    wrapper = shallowMount(ActionBarRestore, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  describe('is disabled', () => {
    beforeEach(() => {
      propsData.disabled = 'This is disabled.'
      wrapper = shallowMount(ActionBarRestore, { propsData })
    })

    afterEach(() => {
      wrapper.destroy()
    })

    itMatchesSnapshot()
  })
})

describe('is active', () => {
  beforeEach(() => {
    propsData.active = true
    wrapper = shallowMount(ActionBarRestore, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  describe('is disabled', () => {
    beforeEach(() => {
      propsData.disabled = 'This is disabled.'
      wrapper = shallowMount(ActionBarRestore, { propsData })
    })

    afterEach(() => {
      wrapper.destroy()
    })

    itMatchesSnapshot()
  })
})
