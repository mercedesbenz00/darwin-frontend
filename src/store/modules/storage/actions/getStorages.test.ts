import { createLocalVue } from '@vue/test-utils'
import { AxiosResponse } from 'axios'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ getStorages: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let apiResponse: any

const currentTeam = buildTeamPayload({ id: 1 })
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
})

describe('storage/addStorage', () => {
  beforeEach(() => {
    apiResponse = <AxiosResponse>{
      data: [
        buildStoragePayload({
          slug: 'slug_1',
          name: 'Slug 1'
        }),
        buildStoragePayload({
          slug: 'slug_2',
          name: 'Slug 2'
        })
      ]
    }
  })

  it('dispatches to correct backend function', async () => {
    jest.spyOn(backend, 'getStorages').mockResolvedValue(apiResponse)
    await store.dispatch('storage/getStorages')
    expect(backend.getStorages).toHaveBeenCalledTimes(1)
  })

  it('returns response data', async () => {
    jest.spyOn(backend, 'getStorages').mockResolvedValue(apiResponse)
    const response = await store.dispatch('storage/getStorages')
    expect(response.data).toEqual(apiResponse.data)
  })

  it('sets storages into store', async () => {
    jest.spyOn(backend, 'getStorages').mockResolvedValue(apiResponse)
    await store.dispatch('storage/getStorages')
    expect(store.state.storage.storages.slug_1).toEqual(apiResponse.data[0])
    expect(store.state.storage.storages.slug_2).toEqual(apiResponse.data[1])
  })
})
