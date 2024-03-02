import { createLocalVue } from '@vue/test-utils'
import { AxiosResponse } from 'axios'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  createStorage: jest.fn(),
  setStorageAsDefault: jest.fn()
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const currentTeam = buildTeamPayload({ id: 1 })
let store: ReturnType<typeof createUnstubbedTestStore>
let payload: any
let apiResponse: AxiosResponse

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
})

describe('storage/addStorage', () => {
  beforeEach(() => {
    payload = buildStoragePayload()
    apiResponse = <AxiosResponse>{
      data: {
        ...payload,
        slug: 'slug_1'
      }
    }
  })

  it('dispatches to correct backend function', async () => {
    jest.spyOn(backend, 'createStorage').mockResolvedValue(apiResponse)
    await store.dispatch('storage/addStorage', payload)
    expect(backend.createStorage).toHaveBeenCalledWith({ teamSlug: currentTeam.slug, storage: payload })
  })

  it('returns response data', async () => {
    jest.spyOn(backend, 'createStorage').mockResolvedValue(apiResponse)
    const response = await store.dispatch('storage/addStorage', payload)
    expect(response.data).toEqual(apiResponse.data)
  })

  it('sets storage into store', async () => {
    jest.spyOn(backend, 'createStorage').mockResolvedValue(apiResponse)
    await store.dispatch('storage/addStorage', payload)
    expect(store.state.storage.storages.slug_1).toEqual(apiResponse.data)
  })

  it('should set storage as default if it\'s truthy', async () => {
    payload.default = true
    apiResponse.data.default = true
    jest.spyOn(backend, 'createStorage').mockResolvedValue(apiResponse)
    jest.spyOn(backend, 'setStorageAsDefault').mockResolvedValue(apiResponse)
    const dispatchSpyOn = jest.spyOn(store, 'dispatch')
    await store.dispatch('storage/addStorage', payload)
    expect(dispatchSpyOn).toHaveBeenLastCalledWith('storage/setStorageAsDefault', apiResponse.data.slug)
  })
})
