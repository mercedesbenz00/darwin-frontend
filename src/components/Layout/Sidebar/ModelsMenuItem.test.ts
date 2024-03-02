/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, mount } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { rootStubAttributes } from 'test/unit/testHelpers'

import ModelsMenuItem from '@/components/Layout/Sidebar/ModelsMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)

const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true,
  'lock-icon': true
}

let router: Router
let store: ReturnType<typeof createTestStore>

const createRouter = (): Router => {
  const router =
    new Router({
      routes: [
        { name: 'Workflow', path: '/workview' }
      ]
    })

  router.push('/')

  return router
}

beforeEach(() => {
  router = createRouter()
  store = createTestStore()
})

const itMatchesSnapshot = (): void => it('matches snapshot', () => {
  const wrapper = mount(ModelsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

const itRendersAsActive = (): void => it('renders as active', () => {
  const wrapper = mount(ModelsMenuItem, { localVue, router, store, stubs })
  expect(rootStubAttributes(wrapper, 'active')).toBeFalsy()
})

const itRendersAsInactive = (): void => it('renders as inactive', () => {
  const wrapper = mount(ModelsMenuItem, { localVue, router, store, stubs })
  expect(rootStubAttributes(wrapper, 'active')).toBeFalsy()
})

describe('on models enabled', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ neural_models_enabled: true }))
  })

  it('renders as router link', () => {
    const wrapper = mount(ModelsMenuItem, { localVue, router, store, stubs })
    expect(wrapper.find('router-link-stub').exists()).toBe(true)
  })

  describe('on inactive route', () => {
    itMatchesSnapshot()
    itRendersAsInactive()
  })

  describe('on active route', () => {
    beforeEach(() => {
      router.push('/models/foo')
    })

    itMatchesSnapshot()
    itRendersAsActive()
  })
})

describe('on models disabled', () => {
  beforeEach(() => {
    store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ neural_models_enabled: false }))
  })

  itMatchesSnapshot()

  it('does not render as router link', () => {
    const wrapper = mount(ModelsMenuItem, { localVue, router, store, stubs })
    expect(wrapper.find('router-link-stub').exists()).toBe(false)
  })
})
