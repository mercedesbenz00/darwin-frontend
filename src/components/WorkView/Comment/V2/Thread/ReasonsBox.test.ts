import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import ReasonsBox from './ReasonsBox.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

beforeEach(() => {
  wrapper = shallowMount(ReasonsBox, { localVue })
})

afterEach(() => {
  wrapper.destroy()
})

describe('ReasonsBox component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
