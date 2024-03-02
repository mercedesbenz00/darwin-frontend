import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import AttributeStack from '@/components/Common/AttributeStack/AttributeStack.vue'

let wrapper: Wrapper<Vue>

beforeEach(() => {
  wrapper = shallowMount(AttributeStack, {
    slots: {
      'primary-attribute': '342',
      'secondary-attribute': 'Files'
    }
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('AttributeStack UI', () => {
  it('should exist', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should display labels', () => {
    const labelPrimary = wrapper.find('.attribute-stack__label--primary')
    const labelSecondary = wrapper.find('.attribute-stack__label--secondary')

    expect(labelPrimary.text()).toBe('342')
    expect(labelSecondary.text()).toBe('Files')
  })
})
