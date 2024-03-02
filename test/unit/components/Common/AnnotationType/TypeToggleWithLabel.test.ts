import { createLocalVue, shallowMount } from '@vue/test-utils'

import { createMockTheme } from 'test/unit/components/mocks'
import { VPopover } from 'test/unit/stubs'
import { triggerRootStub } from 'test/unit/testHelpers'

import TypeToggleWithLabel from '@/components/Common/AnnotationType/TypeToggleWithLabel.vue'

const localVue = createLocalVue()
let propsData: {
  type: string
  label: string
  selected: boolean
  disabled?: boolean
}

let slots: {} | {
  tooltip: string
}

const mocks = {
  $theme: createMockTheme()
}

const stubs = {
  VPopover
}

beforeEach(() => {
  propsData = {
    type: 'polygon',
    label: '50',
    selected: false
  }

  slots = {}
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(TypeToggleWithLabel, { localVue, mocks, propsData, slots, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

const itEmitsClick = () => {
  it('emits click', async () => {
    const wrapper = shallowMount(TypeToggleWithLabel, { localVue, mocks, propsData, slots, stubs })
    await triggerRootStub(wrapper, 'click.native')
    expect(wrapper.emitted().click!.length).toBe(1)
  })
}

itMatchesSnapshot()
itEmitsClick()

describe('when selected', () => {
  beforeEach(() => {
    propsData.selected = true
  })

  itMatchesSnapshot()
  itEmitsClick()
})

describe('when disabled', () => {
  beforeEach(() => {
    propsData.disabled = true
  })

  itMatchesSnapshot()

  it('disables button', () => {
    const wrapper = shallowMount(TypeToggleWithLabel, { localVue, mocks, propsData, slots, stubs })
    expect(wrapper.element.getAttribute('disabled')).toBe('true')
  })
})

describe('when given tooltip', () => {
  beforeEach(() => {
    slots = { tooltip: 'Custom tooltip' }
  })

  itMatchesSnapshot()

  it('renders custom tooltip', () => {
    const wrapper = shallowMount(TypeToggleWithLabel, { localVue, mocks, propsData, slots, stubs })
    expect(wrapper.text()).toContain('Custom tooltip')
  })
})
