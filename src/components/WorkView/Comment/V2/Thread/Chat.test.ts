import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'

import Chat from './Chat.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()

beforeEach(() => {
  wrapper = shallowMount(Chat, { localVue })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Chat component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
