import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('should set config', () => {
  store.commit('sso/SET_CONFIG', 'my config here')
  expect(store.state.sso.config).toBe('my config here')
})
