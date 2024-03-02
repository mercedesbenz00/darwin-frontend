import { createLocalVue, shallowMount } from '@vue/test-utils'

import Lazy from '@/components/Common/Lazy'

const localVue = createLocalVue()

let propsData: {
  width: number,
  height: number,
  padding?: number,
  x: number,
  y: number
}

beforeEach(() => {
  document.body.style.width = '400px'
  document.body.style.height = '400px'

  propsData = {
    width: 200,
    height: 50,
    x: 10,
    y: 10
  }
})

it('should render components that are inside the viewport', () => {
  const wrapper = shallowMount(Lazy, {
    localVue,
    propsData,
    slots: {
      default: '<div id="content">Test content</div>'
    }
  })

  expect(wrapper.find('#content').exists()).toBeTruthy()
})

it('should not render components that are vertically outside the viewport', () => {
  propsData.y = -200

  const wrapper = shallowMount(Lazy, {
    localVue,
    propsData,
    slots: {
      default: '<div id="content">Test content</div>'
    }
  })

  expect(wrapper.find('#content').exists()).toBeFalsy()
})

it('should not render components that are horizontally outside the viewport', () => {
  propsData.x = -400

  const wrapper = shallowMount(Lazy, {
    localVue,
    propsData,
    slots: {
      default: '<div id="content">Test content</div>'
    }
  })

  expect(wrapper.find('#content').exists()).toBeFalsy()
})

it('should render components that are half outside', () => {
  propsData.y = -20

  const wrapper = shallowMount(Lazy, {
    localVue,
    propsData,
    slots: {
      default: '<div id="content">Test content</div>'
    }
  })

  expect(wrapper.find('#content').exists()).toBeTruthy()
})

it('should render components that are inside padding', () => {
  propsData.padding = 100
  propsData.y = -50

  const wrapper = shallowMount(Lazy, {
    localVue,
    propsData,
    slots: {
      default: '<div id="content">Test content</div>'
    }
  })

  expect(wrapper.find('#content').exists()).toBeTruthy()
})
