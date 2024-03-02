import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import RowMenu from './RowMenu.vue'

let wrapper: Wrapper<Vue>

describe('is item row menu', () => {
  beforeEach(() => {
    wrapper = shallowMount(RowMenu, { propsData: { isItem: true, tableId: '1', row: -1 } })
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

  it('should apply correct class', () => {
    expect(wrapper.attributes().class).toContain('row-menu--item')
  })
})

describe('is header row menu', () => {
  beforeEach(() => {
    wrapper = shallowMount(RowMenu, { propsData: { isItem: false, tableId: '1', row: -1 } })
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

  it('should apply correct class', () => {
    expect(wrapper.attributes().class).toContain('row-menu--header')
  })
})
