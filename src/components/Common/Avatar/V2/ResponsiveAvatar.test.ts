import { createLocalVue, shallowMount } from '@vue/test-utils'
import VueLazyload from 'vue-lazyload'

import { createMockTheme } from 'test/unit/components/mocks'

import ResponsiveAvatar from '@/components/Common/Avatar/V1/ResponsiveAvatar.vue'

const localVue = createLocalVue()
localVue.use(VueLazyload)

const mocks = { $theme: createMockTheme() }

let propsData: {
  id: string | number
  name: string
  url?: string
}

let slots: {
  badge?: string
}

beforeEach(() => {
  propsData = {
    id: '1',
    name: 'John Doe',
    url: 'url'
  }

  slots = {}
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ResponsiveAvatar, { localVue, mocks, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

describe('when url is given', () => {
  itMatchesSnapshot()

  it('renders image for url', () => {
    const wrapper = shallowMount(ResponsiveAvatar, { localVue, mocks, propsData, slots })

    expect(wrapper.find('img').exists()).toBe(true)
  })
})

describe('when url is not given', () => {
  beforeEach(() => {
    delete propsData.url
  })

  itMatchesSnapshot()

  it('renders initials', () => {
    const wrapper = shallowMount(ResponsiveAvatar, { localVue, mocks, propsData, slots })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('JD')
  })
})

describe('when badge slot is given', () => {
  beforeEach(() => {
    slots.badge = 'CustomBadge'
  })

  itMatchesSnapshot()

  it('renders badge', () => {
    const wrapper = shallowMount(ResponsiveAvatar, { localVue, mocks, propsData, slots })
    expect(wrapper.text()).toContain('CustomBadge')
  })
})
