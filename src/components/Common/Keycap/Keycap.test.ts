import { createLocalVue, shallowMount } from '@vue/test-utils'

import Keycap from './Keycap.vue'
import { KeycapSize } from './types'

const localVue = createLocalVue()

const itMatchesSnapshot = (setupArgs = {}): void => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(Keycap, { localVue, ...setupArgs })

    expect(wrapper).toMatchSnapshot()
  })
}

describe('by default', () => {
  itMatchesSnapshot()
})

Object.values(KeycapSize).forEach((size) => {
  describe(`when size is ${size}`, () => {
    itMatchesSnapshot({ propsData: { size } })
  })
})
