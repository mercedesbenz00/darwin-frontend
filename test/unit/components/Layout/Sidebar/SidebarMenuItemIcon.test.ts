import { shallowMount, createLocalVue } from '@vue/test-utils'
import { capitalize } from 'lodash'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import SidebarMenuItemIcon from '@/components/Layout/Sidebar/SidebarMenuItemIcon.vue'
import { SidebarMenuItemIconName } from '@/components/Layout/Sidebar/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const icons: SidebarMenuItemIconName[] = [
  'academy',
  'annotators',
  'classes',
  'data-streams',
  'datasets',
  'documentation',
  'feedback',
  'models',
  'open-datasets',
  'paper-plane',
  'plugins',
  'settings'
]

beforeEach(() => {
  store = createTestStore()
})

describe('when expanded', () => {
  beforeEach(() => {
    store.commit('ui/SET_SIDEBAR_MINIMIZED', false)
  })

  icons.forEach(iconName => {
    it(`matches snapshot for ${iconName}`, () => {
      const propsData = { name: iconName, tooltip: capitalize(iconName) }
      const wrapper = shallowMount(SidebarMenuItemIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it(`matches snapshot for active ${iconName}`, () => {
      const propsData = { name: iconName, tooltip: capitalize(iconName), active: true }
      const wrapper = shallowMount(SidebarMenuItemIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })
  })
})

describe('when minimized', () => {
  beforeEach(() => {
    store.commit('ui/SET_SIDEBAR_MINIMIZED', true)
  })

  icons.forEach(iconName => {
    it(`matches snapshot for ${iconName}`, () => {
      const propsData = { name: iconName, tooltip: capitalize(iconName) }
      const wrapper = shallowMount(SidebarMenuItemIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })

    it(`matches snapshot for active ${iconName}`, () => {
      const propsData = { name: iconName, tooltip: capitalize(iconName), active: true }
      const wrapper = shallowMount(SidebarMenuItemIcon, { localVue, propsData, store })
      expect(wrapper).toMatchSnapshot()
    })
  })
})
