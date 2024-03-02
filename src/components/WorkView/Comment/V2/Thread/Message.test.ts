import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import Message from './Message.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createTestStore>

let propsData

beforeEach(() => {
  store = createTestStore()
  propsData = {
    authorId: 1
  }

  wrapper = shallowMount(Message, { localVue, propsData, store })
})

afterEach(() => {
  wrapper.destroy()
})

describe('Message component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
