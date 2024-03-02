import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import Thread from './Thread.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

beforeEach(() => {
  wrapper = shallowMount(Thread, { localVue })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Thread component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
