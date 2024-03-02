import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories/buildAxiosResponse'
import { buildTeamPayload } from 'test/unit/factories/buildTeamPayload'

import { api } from '@/utils'
import { errorMessages } from '@/utils/error/errors'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ id: 1 }))
  jest.spyOn(api, 'put').mockResolvedValue(buildAxiosResponse({ data: { idp_metadata: 'new test config' } }))
  jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: { idp_metadata: 'new test config' } }))
})

afterEach(() => {
  jest.resetAllMocks()
})

it('calls correct backend endpoint with POST', async () => {
  await store.dispatch('sso/saveConfig', 'new test config')
  expect(api.post).toHaveBeenCalledWith('/teams/1/sso/saml', { idp_metadata: 'new test config' })
})

it('calls correct backend endpoint with PUT', async () => {
  store.state.sso.config = 'config'
  await store.dispatch('sso/saveConfig', 'new test config')
  expect(api.put).toHaveBeenCalledWith('/teams/1/sso/saml', { idp_metadata: 'new test config' })
})

it('commits config to store', async () => {
  await store.dispatch('sso/saveConfig', 'new test config')
  expect(store.state.sso.config).toBe('new test config')
})

it('returns parsed error on error', async () => {
  jest.spyOn(api, 'post').mockRejectedValue({ response: { status: 500 } })
  const { error } = await store.dispatch('sso/saveConfig')
  expect(error).toEqual(
    expect.objectContaining({ message: errorMessages.SAVE_SSO_CONFIG.default, status: 500 })
  )
})

it('returns parsed error on error', async () => {
  store.state.sso.config = 'config'

  jest.spyOn(api, 'put').mockRejectedValue({ response: { status: 500 } })
  const { error } = await store.dispatch('sso/saveConfig')
  expect(error).toEqual(
    expect.objectContaining({ message: errorMessages.SAVE_SSO_CONFIG.default, status: 500 })
  )
})
