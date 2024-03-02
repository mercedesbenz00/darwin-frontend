import { createLocalVue, shallowMount } from '@vue/test-utils'

import Shortcut from './Shortcut.vue'
import { ShortcutSize } from './types'

const localVue = createLocalVue()

let propsData: {
  keys: string[],
  size?: ShortcutSize,
  inverted?: boolean
}

beforeEach(() => {
  propsData = { keys: ['M'] }
})

const itMatchesSnapshot = (): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Shortcut, { localVue, propsData })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('by default', () => {
  itMatchesSnapshot()
})

describe('with one key', () => {
  beforeEach(() => {
    propsData.keys = ['F']
  })

  itMatchesSnapshot()

  test('it renders key', () => {
    const wrapper = shallowMount(Shortcut, { localVue, propsData })
    expect(wrapper.find('keycap-stub').text()).toEqual('F')
  })
})

describe('with multiple keys', () => {
  beforeEach(() => {
    propsData.keys = ['F', 'B']
  })

  itMatchesSnapshot()

  test('it renders multiple keys', () => {
    const wrapper = shallowMount(Shortcut, { localVue, propsData })
    expect(wrapper.findAll('keycap-stub').wrappers.map(w => w.text())).toEqual(['F', 'B'])
  })
})

describe('inverted', () => {
  beforeEach(() => {
    propsData.inverted = true
  })

  itMatchesSnapshot()

  it('sets inverted prop', () => {
    const wrapper = shallowMount(Shortcut, { localVue, propsData })
    expect(wrapper.find('keycap-stub').props('inverted')).toBe(true)
  })
})

Object.values(ShortcutSize).forEach((size) => {
  describe(`when size is ${size}`, () => {
    beforeEach(() => { propsData.size = size })
    itMatchesSnapshot()
  })
})
