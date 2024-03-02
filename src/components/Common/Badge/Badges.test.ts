import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import VTooltip from 'v-tooltip'

import { Badges, BadgeType } from '.'

const localVue = createLocalVue()
localVue.use(VTooltip, { defaultHtml: true })

type BadgesProp = {
  items: BadgeType[],
  select?: boolean
  wrap?: boolean
}

const items = [
  { label: 'foo' },
  { label: 'bar' },
  { label: 'baz' }
]

let propsData: BadgesProp

const itMatchesSnapshot = (propsData: BadgesProp): void => it('matches snapshot', () => {
  const wrapper = shallowMount(Badges, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

itMatchesSnapshot({
  items
})

it('is instanciated', () => {
  const _propsData = {
    items
  }

  const wrapper = shallowMount(Badges, { localVue, propsData: _propsData })
  expect(wrapper).toBeTruthy()
})

describe('has correct values', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    items
  }

  beforeEach(async () => {
    propsData = _propsData
    wrapper = shallowMount(Badges, { localVue, propsData })
    await wrapper.setData({ threshold: 3 })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correct number of badges', () => {
    expect(wrapper.findAll('badge-stub').length).toBe(3)
  })

  it('does not renders the more \'...\' badge', () => {
    expect(wrapper.find('.more-badge').exists()).toBe(false)
  })
})

describe('has more badge that can be rendered', () => {
  let wrapper: Wrapper<Vue>

  const _propsData = {
    items
  }

  beforeEach(async () => {
    propsData = _propsData
    wrapper = shallowMount(Badges, { localVue, propsData })
    await wrapper.setData({ threshold: 1 })
  })

  afterEach(() => {
    wrapper.destroy()
  })

  itMatchesSnapshot(_propsData)

  it('renders correct number of badges', () => {
    expect(wrapper.findAll('badge-stub').length).toBe(2) // one is the more badge
  })

  it('renders the more \'...\' badge', () => {
    expect(wrapper.findAll('.more-badge').exists()).toBe(true)
  })
})
