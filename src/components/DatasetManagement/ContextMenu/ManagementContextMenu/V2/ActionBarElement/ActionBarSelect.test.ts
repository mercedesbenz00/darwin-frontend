import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ActionBarSelect from './ActionBarSelect.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  active: false
}

const itMatchesSnapshot = (): void =>
  it('matches snapshot', () => {
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

describe('is active', () => {
  beforeEach(() => {
    wrapper = shallowMount(ActionBarSelect, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()
})

describe('is inactive', () => {
  beforeEach(() => {
    propsData.active = true
    wrapper = shallowMount(ActionBarSelect, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()
})
