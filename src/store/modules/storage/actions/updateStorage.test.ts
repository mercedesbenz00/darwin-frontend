import { createLocalVue } from '@vue/test-utils'
import { AxiosResponse } from 'axios'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'

import { StoragePayload } from '@/store/types/StoragePayload'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  updateStorage: jest.fn(),
  setStorageAsDefault: jest.fn()
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const currentTeam = buildTeamPayload({ id: 1 })
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('storage/SET_STORAGES', [buildStoragePayload()])
})

let payload: StoragePayload
let apiResponse: AxiosResponse<{ data: StoragePayload }>

describe('storage/addStorage', () => {
  beforeEach(() => {
    payload = buildStoragePayload({
      name: 'Updated Slug 1'
    })
    apiResponse = <AxiosResponse>{
      data: payload
    }
  })

  it('dispatches to correct backend function', async () => {
    jest.spyOn(backend, 'updateStorage').mockResolvedValue(apiResponse)
    await store.dispatch('storage/updateStorage', payload)
    expect(backend.updateStorage).toHaveBeenCalledWith({ teamSlug: currentTeam.slug, storage: payload })
  })

  it('returns response data', async () => {
    jest.spyOn(backend, 'updateStorage').mockResolvedValue(apiResponse)
    const response = await store.dispatch('storage/updateStorage', payload)
    expect(response.data).toEqual(apiResponse.data)
  })

  it('sets storage into store', async () => {
    jest.spyOn(backend, 'updateStorage').mockResolvedValue(apiResponse)
    await store.dispatch('storage/updateStorage', payload)
    expect(store.state.storage.storages.slug_1).toEqual(apiResponse.data)
  })

  it('should set storage as default if it\'s truthy', async () => {
    payload.default = true
    jest.spyOn(backend, 'updateStorage').mockResolvedValue(apiResponse)
    jest.spyOn(backend, 'setStorageAsDefault').mockResolvedValue(apiResponse)
    const dispatchSpyOn = jest.spyOn(store, 'dispatch')
    await store.dispatch('storage/updateStorage', payload)
    expect(dispatchSpyOn).toHaveBeenLastCalledWith('storage/setStorageAsDefault', 'slug_1')
  })
})
