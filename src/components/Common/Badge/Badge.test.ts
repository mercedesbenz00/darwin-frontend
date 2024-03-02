import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Vue from 'vue'

import { RGBA } from '@/utils'

import { Badge, BadgeProps } from '.'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

const otherColor = { r: 0, g: 0, b: 0, a: 1 } as RGBA

let propsData: BadgeProps

const itMatchesSnapshot = (propsData: BadgeProps): void => it('matches snapshot', () => {
  const wrapper = shallowMount(Badge, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  label: 'foo',
  color: otherColor
})

it('is instanciated', () => {
  const _propsData = {
    label: 'foo',
    color: otherColor
  }

  const wrapper = shallowMount(Badge, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('has correct values', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    label: 'foo',
    color: otherColor,
    highContrast: false,
    tag: 'div'
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Badge, { localVue, propsData })
  })

  it('should render as a correct tag', () => {
    expect(wrapper.vm.$el.tagName === 'DIV').toBe(true)
  })
})

describe('has correct values', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    label: 'foo',
    color: otherColor,
    highContrast: false
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Badge, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correctly', () => {
    expect(wrapper.find('.badge').exists()).toBe(true)
  })

  it('contain the right label', () => {
    const label = wrapper.find('.badge__content__label')
    expect(label.exists()).toBe(true)
    expect(label.text()).toBe('foo')
  })

  it('should match classes', () => {
    const label = wrapper.find('.badge__content__label')
    expect(label.attributes().class.includes('badge__content__label--none')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('has the correct background-color', () => {
    const content = wrapper.find('.badge')
    expect(content.exists()).toBe(true)
    expect(content.html().includes('background-color: rgba(0, 0, 0, 0.1);')).toBe(true)
    expect(content.html().includes('color: rgb(0, 0, 0);')).toBe(true)
  })
})

describe('test the icon positions when prefix slot it\'s used', () => {
  let wrapper: Wrapper<Vue>
  const slots = {
    'prefix-icon': { template: '<svg />' }
  }

  beforeEach(() => {
    wrapper = shallowMount(Badge, { localVue, propsData, slots })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes', () => {
    const label = wrapper.find('.badge__content__label')
    expect(label.attributes().class.includes('badge__content__label--left')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test the icon positions when suffix slot it\'s used', () => {
  let wrapper: Wrapper<Vue>
  const slots = {
    'suffix-icon': { template: '<svg />' }
  }

  beforeEach(() => {
    wrapper = shallowMount(Badge, { localVue, propsData, slots })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes', () => {
    const label = wrapper.find('.badge__content__label')
    expect(label.attributes().class.includes('badge__content__label--right')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test the icon positions when deletable', () => {
  let wrapper: Wrapper<Vue>
  const _propsData = {
    label: 'foo',
    color: otherColor,
    highContrast: false,
    deletable: true,
    tag: 'div'
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Badge, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes', () => {
    expect(wrapper.find('.badge__content__delete').exists()).toBe(true)
    const label = wrapper.find('.badge__content__label')
    expect(label.attributes().class.includes('badge__content__label--right')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('test the icon positions when both prefix and suffix slot it\'s used', () => {
  let wrapper: Wrapper<Vue>
  const slots = {
    'prefix-icon': { template: '<svg />' },
    'suffix-icon': { template: '<svg />' }
  }

  beforeEach(() => {
    wrapper = shallowMount(Badge, { localVue, propsData, slots })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should match classes', () => {
    const label = wrapper.find('.badge__content__label')
    expect(label.attributes().class.includes('badge__content__label--both')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when highContrast', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    label: 'foo',
    highContrast: true
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Badge, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('choose the right label color', () => {
    const content = wrapper.find('.badge')
    expect(content.exists()).toBe(true)
    expect(content.html().includes('color: rgb(255, 255, 255);')).toBe(true)
  })

  it("choose the right color for label 'foo'", () => {
    const content = wrapper.find('.badge')
    expect(content.exists()).toBe(true)
    // 'rgb(255, 182, 73)' is equal to '#99FF49'
    expect(content.html().includes('background-color: rgb(255, 182, 73);')).toBe(true)
    expect(content.html().includes('color: rgb(255, 255, 255);')).toBe(true)
  })
})

describe('when not highContrast', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    label: 'foo',
    highContrast: false
  }

  beforeEach(() => {
    propsData = _propsData
    wrapper = shallowMount(Badge, { localVue, propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it("choose the right bg and label color for label 'foo'", () => {
    const content = wrapper.find('.badge')
    expect(content.exists()).toBe(true)
    // rgb(97, 120, 58) is equal to rgb(255, 182, 73)
    expect(content.html().includes('background-color: rgba(255, 182, 73, 0.1);')).toBe(true)
    expect(content.html().includes('color: rgb(255, 182, 73);')).toBe(true)
  })
})
