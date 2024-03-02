import { shallowMount, Wrapper } from '@vue/test-utils'
import Vue from 'vue'

import PageLink from './PageLink.vue'
import { PageLinkProps } from './types'

let wrapper: Wrapper<Vue>

const propsData: PageLinkProps = {
  label: 'Custom Label',
  href: '#'
}

beforeEach(() => {
  wrapper = shallowMount(PageLink, { propsData, stubs: ['router-link'] })
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

it('should display the label properly', () => {
  expect(wrapper.find('.pl__label').text()).toEqual('Custom Label')
})

it('should use correct link', () => {
  expect(wrapper.find('.pl__label').attributes().to).toEqual('#')
})
