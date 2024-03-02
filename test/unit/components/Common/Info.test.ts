import { createLocalVue, shallowMount, Slots } from '@vue/test-utils'

import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { VPopover } from 'test/unit/stubs'

import Info from '@/components/Common/Info.vue'

const localVue = createLocalVue()
localVue.directive('tooltip', stubDirectiveWithAttribute)
let propsData: {
  icon?: string
  title?: string
  svgOverlayColor?: string
  popoverClass?: string
}

let slots: Slots

const stubs = { VPopover }

it('matches snapshot when there is icon, title, content without overlay color', () => {
  propsData = { icon: 'icon', title: 'title' }
  slots = { default: 'content' }
  const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when there is icon, title, content with overlay color', () => {
  propsData = { icon: 'icon', title: 'title', svgOverlayColor: '#000000' }
  slots = { default: 'content' }
  const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when there is title and content', () => {
  propsData = { title: 'title' }
  slots = { default: 'content' }
  const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when there is content only', () => {
  propsData = { }
  slots = { default: 'content' }
  const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when given slot + popover class', () => {
  beforeEach(() => {
    propsData = {
      popoverClass: 'custom-class'
    }

    slots = {
      default: 'Popover content'
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('passes popover class onto popover', () => {
    const wrapper = shallowMount(Info, { localVue, propsData, slots, stubs })
    expect(wrapper.find('.v-popover-stub').props('popoverClass')).toEqual('custom-class')
  })
})
