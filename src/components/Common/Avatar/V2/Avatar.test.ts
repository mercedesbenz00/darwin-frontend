import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import { createMockTheme } from 'test/unit/components/mocks'

import Avatar from '@/components/Common/Avatar/V1/Avatar.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const mocks = { $theme: createMockTheme() }

it('renders avatar', () => {
  const propsData = {
    id: '1',
    name: 'avatar',
    url: 'url'
  }
  const wrapper = shallowMount(Avatar, { localVue, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('renders initials', () => {
  const propsData = {
    id: '1',
    name: 'avatar'
  }

  const wrapper = shallowMount(Avatar, { localVue, propsData, mocks })
  expect(wrapper).toMatchSnapshot()
})
