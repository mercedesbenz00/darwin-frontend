import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import MainLayout from './Main.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
const slots = { content: 'content' }
const mocks = {
  $featureEnabled: (): boolean => false
}
beforeEach(() => { store = createTestStore() })

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(MainLayout, { localVue, mocks, slots, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when authenticated', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', true)
  })

  itMatchesSnapshot()
})

describe('when not-authenticated', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', false)
  })

  itMatchesSnapshot()
})

describe('on workflows 2.0', () => {
  beforeEach(() => {
    store.commit('auth/SET_AUTHENTICATED', true)
    mocks.$featureEnabled = (): boolean => true
  })

  itMatchesSnapshot()

  it('renders workflow loader', () => {
    const wrapper = shallowMount(MainLayout, { localVue, mocks, slots, store })
    expect(wrapper.find('workflow-loader-stub').exists()).toBe(true)
  })
})
