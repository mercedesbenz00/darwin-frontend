import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import RegisterMembers from '@/views/teams/RegisterMembers.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: { query: { token: String } },
  $router: {
    push: (path: String) => void,
    replace: (path: String) => void
  }
}

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $route: { query: { token: 'token' } },
    $router: {
      push: jest.fn(),
      replace: jest.fn()
    }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(RegisterMembers, { localVue, mocks, store })
  expect(wrapper).toMatchSnapshot()
})

it('logout button logs you out', async () => {
  const wrapper = shallowMount(RegisterMembers, { localVue, mocks, store })
  await wrapper.find('.logins__link').trigger('click')
  expect(store.dispatch).toBeCalledWith('auth/logout')
  await flushPromises()
  expect(mocks.$router.replace).toBeCalledWith('/login')
})

it('redirect to Datasets page after successful registration', async () => {
  const wrapper = shallowMount(RegisterMembers, { localVue, mocks, store })
  await wrapper.find('register-members-form-stub').vm.$emit('submitted')
  expect(mocks.$router.push).toBeCalledWith('/datasets')
})
