import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { IconMonoStep } from '@/assets/icons/V2/Mono'

import ActionBarElement from './ActionBarElement.vue'
import { ActionBarType as ComponentType } from './types'

let wrapper: Wrapper<Vue>

const propsData = {
  type: ComponentType.DEFAULT,
  active: true
}

const itMatchesSnapshot = (): void =>
  it('matches snapshot', () => {
    expect(wrapper.exists()).toBeTruthy()
    expect(wrapper).toMatchSnapshot()
  })

describe('is default type', () => {
  beforeEach(() => {
    wrapper = shallowMount(ActionBarElement, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()
})

describe('is danger type', () => {
  beforeEach(() => {
    propsData.type = ComponentType.DANGER
    wrapper = shallowMount(ActionBarElement, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()
})

describe('is select type', () => {
  beforeEach(() => {
    propsData.type = ComponentType.SELECT
    wrapper = shallowMount(ActionBarElement, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot()
})

it('should render slot when passed', () => {
  const wrapper = shallowMount(ActionBarElement, {
    propsData,
    slots: { prefixComp: IconMonoStep }
  })

  expect(wrapper.find('.action-bar-el__icon-wrapper').exists()).toBeTruthy()
})
