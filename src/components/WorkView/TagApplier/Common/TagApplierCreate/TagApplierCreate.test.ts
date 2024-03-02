import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import TagApplierCreate from './TagApplierCreate.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

let propsData: {
  keyword: string
}

beforeEach(() => {
  propsData = {
    keyword: ''
  }
  wrapper = shallowMount(TagApplierCreate, {
    propsData,
    localVue
  })
})

afterEach(() => {
  wrapper.destroy()
})

describe('TagApplierCreate', () => {
  it('should mount', () => {
    expect(wrapper.exists()).toBeTruthy()
  })

  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('emit create', async () => {
    await wrapper.setProps({ keyword: 'new-tag' })
    const button = wrapper.find('.tag-applier__create__button')
    await button.vm.$emit('click')
    expect(wrapper.emitted().create).toEqual([['new-tag']])
  })
})
