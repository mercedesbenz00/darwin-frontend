import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'

import Sidebar from '@/components/DatasetManagement/Sidebar/Sidebar.vue'
import loadingDirective from '@/directives/loading'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

let store: ReturnType<typeof createTestStore>
const mocks = { $theme: createMockTheme() }

beforeEach(() => { store = createTestStore() })

it('matches snapshot with default content', () => {
  const slots = { default: '<div>Sidebar Content</div>' }
  const wrapper = shallowMount(Sidebar, { localVue, slots, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when minimized', async () => {
  const slots = { default: '<div>Sidebar Content</div>' }
  const wrapper = shallowMount(Sidebar, { localVue, slots, mocks, store })
  wrapper.find('.dataset-management__sidebar__notch').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when sidebar is in the back', async () => {
  store.commit('ui/SET_IS_SIDEBAR_FRONT', false)
  const slots = { default: '<div>Sidebar Content</div>' }
  const wrapper = shallowMount(Sidebar, { localVue, slots, mocks, store })
  wrapper.find('.dataset-management__sidebar__notch').trigger('click')
  await wrapper.vm.$nextTick()
  expect(wrapper).toMatchSnapshot()
})
