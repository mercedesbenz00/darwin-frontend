import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { TfaCredentials } from '@/store/modules/auth/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const MUTATION = 'auth/SET_2FA_CREDENTIALS'

it('updates 2fa credentials', () => {
  const tfaCredentials: TfaCredentials = {
    email: 'test@v7labs.com',
    password: 'Password1'
  }

  store.commit(MUTATION, tfaCredentials)
  expect(store.state.auth.tfaCredentials).toEqual(tfaCredentials)
})

it('updates 2fa credentials to null', () => {
  store.commit(MUTATION, null)
  expect(store.state.auth.tfaCredentials).toEqual(null)
})
