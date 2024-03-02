import { createLocalVue, shallowMount } from '@vue/test-utils'

import PopupMenuItem from '@/components/Common/PopupMenu/V1/PopupMenuItem.vue'

const localVue = createLocalVue()
let propsData: {
  disabled?: boolean
  theme?: 'standard' | 'crimson'
}
const slots = {
  default: 'default'
}

beforeEach(() => { propsData = {} })

it('matches snapshot', () => {
  const wrapper = shallowMount(PopupMenuItem, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData.disabled = true
  const wrapper = shallowMount(PopupMenuItem, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when theme is crimson', () => {
  propsData.theme = 'crimson'
  const wrapper = shallowMount(PopupMenuItem, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with icon', () => {
  const slots = {
    default: 'default',
    icon: 'icon'
  }
  const wrapper = shallowMount(PopupMenuItem, { localVue, propsData, slots })
  expect(wrapper).toMatchSnapshot()
})
