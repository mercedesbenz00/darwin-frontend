import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'

import DraggableResizable from './DraggableResizable.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

let propsData: {
  initialHeight: number
  minHeight: number
  maxHeight: number
  vertical: boolean
  parentHeight: number
}

beforeEach(() => {
  propsData = {
    initialHeight: 60,
    minHeight: 20,
    maxHeight: 100,
    vertical: true,
    parentHeight: 800
  }
  wrapper = shallowMount(DraggableResizable, {
    propsData,
    localVue,
    mocks: { $theme: createMockTheme() },
    stubs: { 'vue-draggable-resizable': true }
  })
})

describe('DraggableResizable', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes when vertical', () => {
    const label = wrapper.find('.draggable-resizable')
    expect(label.attributes().class.includes('draggable-resizable--vertical')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })

  it('should match classes when horizontal', async () => {
    await wrapper.setProps({ vertical: false })
    const label = wrapper.find('.draggable-resizable')
    expect(label.attributes().class.includes('draggable-resizable--horizontal')).toBe(true)
    expect(wrapper).toMatchSnapshot()
  })
})
