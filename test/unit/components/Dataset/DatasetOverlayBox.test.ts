import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildUserPayload } from 'test/unit/factories'

import DatasetOverlayBox from '@/components/Dataset/DatasetOverlayBox.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('user/SET_PROFILE', buildUserPayload())
})

const itMatchesSnapshot = () => it('matches snapshot', () => {
  const wrapper = shallowMount(DatasetOverlayBox, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

describe('when no logged-in user', () => {
  beforeEach(() => {
    store.commit('user/SET_PROFILE', null)
  })

  itMatchesSnapshot()

  it('renders nothing', () => {
    const wrapper = shallowMount(DatasetOverlayBox, { localVue, store })
    expect(wrapper.html()).toEqual('')
  })
})
