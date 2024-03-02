import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import ThreadFooter from './ThreadFooter.vue'

let wrapper: Wrapper<Vue>
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
let store: ReturnType<typeof createTestStore>

let propsData

beforeEach(() => {
  store = createTestStore()
  propsData = {
    authorId: 1
  }

  wrapper = shallowMount(ThreadFooter, { localVue, propsData, store })
})

afterEach(() => {
  wrapper.destroy()
})

describe('ThreadFooter component', () => {
  it('should match snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })
})
