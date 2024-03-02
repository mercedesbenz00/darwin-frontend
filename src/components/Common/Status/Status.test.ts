import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vue from 'vue'

import { Status, StatusOptions } from '.'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

type StatusProp = {
  value: StatusOptions,
}

let propsData: StatusProp

const itMatchesSnapshot = (propsData: StatusProp): void => it('matches snapshot', () => {
  const wrapper = shallowMount(Status, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  value: StatusOptions.ACTIVE
})

it('is instanciated', () => {
  const _propsData = {
    value: StatusOptions.ACTIVE
  }

  const wrapper = shallowMount(Status, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('has value is active', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    value: StatusOptions.ACTIVE
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Status, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.status').exists()).toBe(true)
  })

  it('contain the right icon color', () => {
    const icon = wrapper.find('.status__content__icon')
    expect(icon.classes().includes('status__content__icon--active')).toBe(true)
  })
})

describe('has value is inactive', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    value: StatusOptions.INACTIVE
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Status, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.status').exists()).toBe(true)
  })

  it('contain the right icon color class', () => {
    const icon = wrapper.find('.status__content__icon')
    expect(icon.classes().includes('status__content__icon--inactive')).toBe(true)
  })

  it('contain the right outline class', async () => {
    await wrapper.setProps({ outline: true })
    const icon = wrapper.find('.status__content__icon')
    expect(icon.classes().includes('status__content__icon--inactive--outline')).toBe(true)
  })
})
