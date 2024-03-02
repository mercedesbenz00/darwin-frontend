import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import ToolOptionOverlay from '@/components/WorkView/ToolOptionOverlay.vue'

let store: ReturnType<typeof createTestStore>

const localVue = createLocalVue()
localVue.use(Vuex)

beforeEach(() => { store = createTestStore() })

describe('with no text', () => {
  beforeEach(() => { store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', null) })

  it('renders nothing', () => {
    const wrapper = shallowMount(ToolOptionOverlay, { localVue, store })
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.html()).toEqual('')
  })
})

describe('with overlay text', () => {
  beforeEach(() => { store.commit('ui/SET_WORKVIEW_OVERLAY_TEXT', 'Workview Overlay Text') })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ToolOptionOverlay, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
})
