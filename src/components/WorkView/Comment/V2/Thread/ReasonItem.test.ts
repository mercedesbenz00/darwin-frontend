import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import ReasonItem from './ReasonItem.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

beforeEach(() => {
  wrapper = shallowMount(ReasonItem, { localVue })
})

afterEach(() => {
  wrapper.destroy()
})

describe('ReasonItem component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
