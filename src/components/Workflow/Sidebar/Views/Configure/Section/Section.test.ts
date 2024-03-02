import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import SidebarConfigureSection from './Section.vue'

let wrapper: Wrapper<Vue>

const propsData = {
  backgroundColor: '#EEEEEE',
  label: 'Configure View'
}

beforeEach(() => {
  wrapper = shallowMount(SidebarConfigureSection, {
    propsData,
    slots: {
      default: '<h1 id="slot">I am a child component</h1>'
    }
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Configure Section UI', () => {
  it('should mount properly', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display label properly', () => {
    const label = wrapper.find('.configure-section__label')

    expect(label.exists()).toBeTruthy()
    expect(label.text()).toEqual('Configure View')
  })

  it('should display the correct backgroundColor', async () => {
    const content = wrapper.find('.configure-section__content')

    expect(content.exists()).toBeTruthy()
    expect(content.attributes().style).toMatch(/(#EEEEEE)/i)

    await wrapper.setProps({
      label: 'Test',
      backgroundColor: undefined
    })
    await Vue.nextTick()
    expect(content.attributes().style).toMatch(/(#FFFFFF)/i)
  })

  it('should display the default slot', () => {
    const slot = wrapper.find('#slot')
    expect(slot.exists()).toBeTruthy()
  })
})
