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
  jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: { idp_metadata: 'config' } }))
})

afterEach(() => {
  (api.get as jest.Mock).mockReset()
})

it('calls correct backend endpoint', async () => {
  await store.dispatch('sso/loadConfig')
  expect(api.get).toHaveBeenCalledWith('/teams/1/sso/saml')
})

it('commits config to store', async () => {
  await store.dispatch('sso/loadConfig')
  expect(store.state.sso.config).toBe('config')
})

it('returns empty response on 404 error', async () => {
  jest.spyOn(api, 'get').mockRejectedValue({ response: { status: 404 } })
  const { data } = await store.dispatch('sso/loadConfig')
  expect(store.state.sso.config).toBe('')
  expect(data).toEqual({ idp_metadata: '' })
})

it('returns parsed error on error', async () => {
  jest.spyOn(api, 'get').mockRejectedValue({ response: { status: 500 } })
  const { error } = await store.dispatch('sso/loadConfig')
  expect(error).toEqual(
    expect.objectContaining({ message: errorMessages.LOAD_SSO_CONFIG.default, status: 500 })
  )
})
