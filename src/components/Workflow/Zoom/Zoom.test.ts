import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import { Zoom, ZoomProps } from '.'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

const propsData: ZoomProps = {
  playground: document.createElement('div'),
  playgroundContent: document.createElement('div'),
  playgroundFrame: document.createElement('div')
}

beforeEach(() => {
  wrapper = shallowMount(Zoom, {
    localVue,
    propsData
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Testing Workflow Zoom UI', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })
})
