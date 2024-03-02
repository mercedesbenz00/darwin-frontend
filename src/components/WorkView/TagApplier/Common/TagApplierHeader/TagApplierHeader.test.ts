import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import TagApplierHeader from './TagApplierHeader.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

let propsData: {
  direction: string
}

beforeEach(() => {
  propsData = {
    direction: 'asc'
  }
  wrapper = shallowMount(TagApplierHeader, {
    propsData,
    localVue
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('TagApplierHeader', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('should contain the right subtitle when enabled', () => {
    const subtitle = wrapper.find('.tag-applier__header__subtitle')
    expect(subtitle.text()).toBe('Select a tag or type a new one below')
  })

  it('should contain the right subtitle when enabled', async () => {
    await wrapper.setProps({ disabled: true })
    const subtitle = wrapper.find('.tag-applier__header__subtitle')
    expect(subtitle.text()).toBe('You can\'t add tags on completed stages')
  })

  it('emit cahnge direction', async () => {
    await wrapper.vm.$emit('change:direction', 'desc')
    expect(wrapper.emitted()['change:direction']).toEqual([['desc']])
  })
})
