import { createLocalVue, mount, Slots } from '@vue/test-utils'

import SummaryItemLayout from '@/components/Plans/Product/Usage/SummaryItemLayout.vue'

const localVue = createLocalVue()
let slots: Slots

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = mount(SummaryItemLayout, { localVue, slots })
  expect(wrapper).toMatchSnapshot()
})

describe('when partial slots given', () => {
  beforeEach(() => {
    slots = {
      'footer-left': 'Bonus: 20',
      'footer-right': 'Remaining: 50',
      bar: 'Usage Bar Goes Here'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = mount(SummaryItemLayout, { localVue, slots })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.text()).toContain('Bonus: 20')
    expect(wrapper.text()).toContain('Remaining: 50')
    expect(wrapper.text()).toContain('Usage Bar Goes Here')
  })
})

describe('when full slots given', () => {
  beforeEach(() => {
    slots = {
      'footer-left': 'Bonus: 20',
      'footer-right': 'Remaining: 50',
      'title-aside': 'Usage Limiter Goes Here',
      bar: 'Usage Bar Goes Here',
      title: 'Random Team'
    }
  })

  itMatchesSnapshot()

  it('renders slots', () => {
    const wrapper = mount(SummaryItemLayout, { localVue, slots })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.text()).toContain('Bonus: 20')
    expect(wrapper.text()).toContain('Remaining: 50')
    expect(wrapper.text()).toContain('Usage Bar Goes Here')
    expect(wrapper.text()).toContain('Usage Limiter Goes Here')
    expect(wrapper.text()).toContain('Random Team')
  })
})
