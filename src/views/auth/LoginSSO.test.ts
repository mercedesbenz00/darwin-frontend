import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { NavigationGuard, Route } from 'vue-router'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'
import * as utils from '@/utils'
import LoginSSO from '@/views/auth/LoginSSO.vue'

jest.mock('@/utils/token')

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let mocks: {
  $ga: { event: jest.Mock },
  $route: { params: {}, query: {} },
  $router: {
    push: jest.Mock,
    beforeEach: jest.Mock,
    currentRoute: Route
  },
  $featureEnabled: Function
}
let store: ReturnType<typeof createTestStore>
let beforeEachMock: jest.Mock
let currentRouteMock: Route
beforeEach(() => {
  store = createTestStore()
  currentRouteMock = {
    name: 'LoginSSO',
    path: '/login-sso',
    hash: '',
    fullPath: '/login-sso',
    query: {},
    params: {},
    matched: []
  }
  beforeEachMock = jest.fn().mockImplementation((guard: NavigationGuard) => {
    guard(currentRouteMock, currentRouteMock, jest.fn())
  })
  jest.spyOn(utils, 'getToken').mockReturnValue(null)
  mocks = {
    $ga: { event: jest.fn() },
    $route: { params: {}, query: {} },
    $router: {
      push: jest.fn(),
      beforeEach: beforeEachMock,
      currentRoute: currentRouteMock
    },
    $featureEnabled: jest.fn().mockReturnValue(false)
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(LoginSSO, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('submits the form will trigger auth/loginWithSSO action', async () => {
  jest.spyOn(store, 'dispatch').mockResolvedValue({
    data: {}
  })
  const wrapper = shallowMount(LoginSSO, { localVue, mocks, store })
  await wrapper.find('input-field-stub[name="teamName"]').vm.$emit('input', 'Test team')
  await wrapper.find('form').trigger('submit')
  expect(store.dispatch).toBeCalledWith('auth/loginWithSSO', {
    teamName: 'Test team'
  })
  await flushPromises()
  expect(mocks.$ga.event).toBeCalledWith('login', 'submit', 'success')
})
