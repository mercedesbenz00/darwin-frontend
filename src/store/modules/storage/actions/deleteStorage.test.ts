import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { buildAxiosResponse } from 'test/unit/factories/buildAxiosResponse'
import { buildStoragePayload } from 'test/unit/factories/buildStoragePayload'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ deleteStorage: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

const currentTeam = buildTeamPayload({ id: 1 })
let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  store.commit('storage/SET_STORAGES', [buildStoragePayload()])
})

describe('storage/deleteStorage', () => {
  it('dispatches to correct backend function', async () => {
    jest.spyOn(backend, 'deleteStorage').mockResolvedValue(buildAxiosResponse({ data: {} }))
    await store.dispatch('storage/deleteStorage', 'slug_1')
    expect(backend.deleteStorage).toHaveBeenCalledWith({ teamSlug: currentTeam.slug, storageSlug: 'slug_1' })
  })

  it('delete storage from the store', async () => {
    jest.spyOn(backend, 'deleteStorage').mockResolvedValue(buildAxiosResponse({ data: {} }))
    await store.dispatch('storage/deleteStorage', 'slug_1')
    expect(store.state.storage.storages.slug_1).toBeUndefined()
  })
})
