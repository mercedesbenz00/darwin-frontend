/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, shallowMount } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import WorkflowsMenuItem from '@/components/Layout/Sidebar/WorkflowsMenuItem.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Router)

let router: Router

const stubs = {
  'router-link': true,
  'v2-sidebar-menu-item-icon': true
}

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

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  router = createRouter()
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(WorkflowsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on active route', () => {
  router.push('/workflows/foo')
  const wrapper = shallowMount(WorkflowsMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
