/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, mount } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import AnnotatorsMenuItem from '@/components/Layout/Sidebar/AnnotatorsMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)

const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true
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

it('matches snapshot', () => {
  store.commit('auth/SET_ABILITIES', [
    { subject: 'all', actions: ['view_full_datasets'] }
  ])

  const wrapper = mount(AnnotatorsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when annotator', () => {
  const wrapper = mount(AnnotatorsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on active route', () => {
  store.commit('auth/SET_ABILITIES', [
    { subject: 'all', actions: ['view_full_datasets'] }
  ])

  router.push('/annotators/foo')

  const wrapper = mount(AnnotatorsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
