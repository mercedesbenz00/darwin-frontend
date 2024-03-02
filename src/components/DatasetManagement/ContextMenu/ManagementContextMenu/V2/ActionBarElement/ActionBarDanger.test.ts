import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import ActionBarDanger from './ActionBarDanger.vue'
import { DangerMode } from './types'

let wrapper: Wrapper<Vue>

const propsData = {
  mode: DangerMode.DELETE
}

const itMatchesSnapshot = (): void =>
  it('matches snapshot', () => {
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

describe('is mode delete', () => {
  beforeEach(() => {
    wrapper = shallowMount(ActionBarDanger, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  it('should render the label correct', () => {
    expect(wrapper.find('.action-bar-el__label').text()).toEqual('Delete')
  })
})

describe('is mode archive', () => {
  beforeEach(() => {
    propsData.mode = DangerMode.ARCHIVE
    wrapper = shallowMount(ActionBarDanger, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()

  it('should render the label correct', () => {
    expect(wrapper.find('.action-bar-el__label').text()).toEqual('Archive')
  })
})
