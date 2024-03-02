/**
 * NOTE: Sidebar menu item components heavily integrate with a layout component,
 * so we deep-mount them for snapshot testing, to ensure nothing breaks
 */

import { createLocalVue, mount } from '@vue/test-utils'
import Router from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import ClassesMenuItem from '@/components/Layout/Sidebar/ClassesMenuItem.vue'

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
  const wrapper = mount(ClassesMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot on active route', () => {
  router.push('/classes/foo')
  const wrapper = mount(ClassesMenuItem, { localVue, router, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
