import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import Slider from './Slider.vue'
import { SliderProps, SliderVariant } from './types'

let wrapper: Wrapper<Vue>

const propsData: SliderProps = {
  variant: SliderVariant.DEFAULT,
  value: 0,
  min: 0,
  max: 100,
  step: 25
}

describe('variant=DEFAULT', () => {
  beforeEach(() => {
    wrapper = shallowMount(Slider, { propsData })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})

describe('variant=STEPS', () => {
  beforeEach(() => {
    wrapper = shallowMount(Slider, {
      propsData: {
        ...propsData,
        variant: SliderVariant.STEPS
      }
    })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  it('should render properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should render all blocks', () => {
    expect(wrapper.findAll('.slider-step').length).toEqual(4)
  })
})
