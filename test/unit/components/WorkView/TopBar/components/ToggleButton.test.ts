import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'

import { VPopover } from 'test/unit/stubs'

import ToggleButton from '@/components/WorkView/TopBar/components/ToggleButton.vue'

const localVue = createLocalVue()
const stubs: Stubs = { VPopover }

let propsData: {
  on: boolean
  tooltipContent?: string
}
let slots: {
  default: string
  tooltipe: string
}

beforeEach(() => {
  propsData = { on: false }
  slots = {
    default: 'Default Slot',
    tooltipe: 'Tooltip Slot'
  }
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(ToggleButton, { localVue, propsData, slots, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when toggled on', () => {
  beforeEach(() => {
    propsData.on = true
  })

  itMatchesSnapshot()
})

describe('when toggled off', () => {
  beforeEach(() => {
    propsData.on = false
  })

  itMatchesSnapshot()
})

it('emits toggle event', async () => {
  const wrapper = shallowMount(ToggleButton, { localVue, propsData, slots, stubs })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted().toggle).toBeDefined()
})
