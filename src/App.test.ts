import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import App from '@/App.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
const stubs = ['router-view', 'portal-target']

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

jest.mock('@/engine/editor', () => ({ Editor: class {} }))
jest.mock('@/engine/managers', () => ({ ItemManager: class {} }))

it('matches snapshot on main layout', () => {
  const wrapper = shallowMount(App, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders ClassLoader component, to load team-wide classes', () => {
  const wrapper = shallowMount(App, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
  expect(wrapper.find('class-loader-stub').exists()).toBe(true)
})

it('loads annotation types', () => {
  shallowMount(App, { localVue, store, stubs })
  expect(store.dispatch).toHaveBeenCalledWith('aclass/loadAnnotationTypes')
})
