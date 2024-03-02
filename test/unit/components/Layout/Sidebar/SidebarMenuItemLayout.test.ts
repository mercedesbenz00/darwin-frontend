import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { rootStubAttributes } from 'test/unit/testHelpers'

import SidebarMenuItemLayout from '@/components/Layout/Sidebar/SidebarMenuItemLayout.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let propsData: {
  active?: boolean
  tag?: string
}
let attrs: Record<string, string>
let stubs: Record<string, boolean>

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  attrs = {}
  propsData = {}
  stubs = {}
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = shallowMount(SidebarMenuItemLayout, { attrs, localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('when all defaults', () => {
  itMatchesSnapshot()
})

describe('when custom tag', () => {
  beforeEach(() => {
    propsData.tag = 'a'
  })

  itMatchesSnapshot()
})

describe('when router link with "to"', () => {
  beforeEach(() => {
    stubs['router-link'] = true
    propsData.tag = 'router-link'
    attrs.to = 'datasets'
  })

  itMatchesSnapshot()

  it('passes "to" as prop to child', () => {
    const wrapper = shallowMount(SidebarMenuItemLayout, { attrs, localVue, propsData, store, stubs })
    expect(rootStubAttributes(wrapper, 'to')).toEqual('datasets')
  })
})

describe('when sidebar minimized', () => {
  beforeEach(() => {
    store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
  })

  itMatchesSnapshot()
})

describe('when active', () => {
  beforeEach(() => {
    propsData.active = true
  })
  itMatchesSnapshot()
})
