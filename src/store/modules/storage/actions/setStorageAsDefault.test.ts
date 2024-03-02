import { createLocalVue } from '@vue/test-utils'
import { AxiosResponse } from 'axios'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'

import { StoragePayload } from '@/store/types/StoragePayload'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({
  setStorageAsDefault: jest.fn()
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const item: StoragePayload = buildStoragePayload()

const currentTeam = buildTeamPayload({ id: 1 })
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('storage/SET_STORAGES', [item])
})

let apiResponse: AxiosResponse<{ data: StoragePayload }>

describe('storage/setStorageAsDefault', () => {
  beforeEach(() => {
    apiResponse = <AxiosResponse>{
      data: {
        ...item,
        default: true
      }
    }
  })

  it('dispatches to correct backend function', async () => {
    jest.spyOn(backend, 'setStorageAsDefault').mockResolvedValue(apiResponse)
    await store.dispatch('storage/setStorageAsDefault', item.slug)
    expect(backend.setStorageAsDefault).toHaveBeenCalledWith({ teamSlug: currentTeam.slug, storageSlug: item.slug })
  })

  it('returns response data', async () => {
    jest.spyOn(backend, 'setStorageAsDefault').mockResolvedValue(apiResponse)
    const response = await store.dispatch('storage/setStorageAsDefault', item.slug)
    expect(response.data).toEqual(apiResponse.data)
  })

  it('should update default property into store', async () => {
    jest.spyOn(backend, 'setStorageAsDefault').mockResolvedValue(apiResponse)
    await store.dispatch('storage/setStorageAsDefault', item.slug)
    expect(store.state.storage.storages.slug_1.default).toBeTruthy()
  })
})
