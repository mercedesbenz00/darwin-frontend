import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildApiKeyPayload, buildAxiosResponse, buildTeamPayload } from 'test/unit/factories'

import { ApiKeyPermission } from '@/store/modules/apiKey/types'
import * as api from '@/utils/api'

const localVue = createLocalVue()
localVue.use(Vuex)

const key1 = buildApiKeyPayload({ id: 1, team_id: 1 })
const key2 = buildApiKeyPayload({ id: 2, team_id: 1 })

const team = buildTeamPayload({ id: 1, name: 'V7' })

const unauthorizedError = {
  response: { status: 401 }
}

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

describe('apiKey/getKeys', () => {
  it('calls api', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [key1, key2] }))
    await store.dispatch('apiKey/getKeys')

    expect(api.get).toHaveBeenCalledWith('api_keys')
  })

  it('returns data retrieved from api', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [key1, key2] }))
    const response = await store.dispatch('apiKey/getKeys')

    expect(response.data).toEqual([key1, key2])
  })

  it('pushes to store', async () => {
    jest.spyOn(api, 'get').mockResolvedValue(buildAxiosResponse({ data: [key1, key2] }))
    await store.dispatch('apiKey/getKeys')

    expect(store.state.apiKey.apiKeys).toEqual([key1, key2])
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'get').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('apiKey/getKeys')

    expect(response).toEqual({
      error: expect.objectContaining({
        message: 'Cannot fetch data. Please try refreshing the page.',
        status: 401
      })
    })
  })
})

describe('apiKey/create', () => {
  const name = 'Test Key'
  const permissions: ApiKeyPermission[] = [['view_team', 'all'], ['update_team', 'all']]
  const createdResponse = { ...key1, name, permissions }

  it('calls api', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: createdResponse }))

    await store.dispatch('apiKey/create', { name, permissions, team })

    expect(api.post).toHaveBeenCalledWith(`teams/${team.id}/api_keys`, { name, permissions })
  })

  it('returns data retrieved from api', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: createdResponse }))
    const response = await store.dispatch('apiKey/create', { name, permissions, team })

    expect(response.data).toEqual(createdResponse)
  })

  it('pushes key into store', async () => {
    jest.spyOn(api, 'post').mockResolvedValue(buildAxiosResponse({ data: createdResponse }))
    await store.dispatch('apiKey/create', { name, permissions, team })

    expect(store.state.apiKey.apiKeys).toEqual([createdResponse])
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'post').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('apiKey/create', { name, permissions, team })

    expect(response).toEqual({
      error: expect.objectContaining({
        message: 'Cannot create key. Please try refreshing the page.',
        status: 401
      })
    })
  })
})

describe('apiKey/deleteKey', () => {
  it('calls api', async () => {
    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({}))
    await store.dispatch('apiKey/deleteKey', key1)

    expect(api.remove).toHaveBeenCalledWith('api_keys/1', {})
  })

  it('returns data retrieved from api', async () => {
    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({}))
    const response = await store.dispatch('apiKey/deleteKey', key1)

    expect(response.data).toEqual({})
  })

  it('removes key from store', async () => {
    store.commit('apiKey/SET_API_KEYS', [key1, key2])

    jest.spyOn(api, 'remove').mockResolvedValue(buildAxiosResponse({}))
    await store.dispatch('apiKey/deleteKey', key1)

    expect(store.state.apiKey.apiKeys).toEqual([key2])
  })

  it('returns error with parsed message', async () => {
    jest.spyOn(api, 'remove').mockRejectedValue(unauthorizedError)
    const response = await store.dispatch('apiKey/deleteKey', key1)

    expect(response).toEqual({
      error: expect.objectContaining({
        message: 'Cannot revoke key. Please try refreshing the page.',
        status: 401
      })
    })
  })
})

describe('apiKey/SET_API_KEYS', () => {
  it('sets api keys', () => {
    expect(store.state.apiKey.apiKeys).toEqual([])

    store.commit('apiKey/SET_API_KEYS', [key1])
    expect(store.state.apiKey.apiKeys).toEqual([key1])

    store.commit('apiKey/SET_API_KEYS', [key2])
    expect(store.state.apiKey.apiKeys).toEqual([key2])

    store.commit('apiKey/SET_API_KEYS', [key1, key2])
    expect(store.state.apiKey.apiKeys).toEqual([key1, key2])
  })
})

describe('apiKey/PUSH_API_KEY', () => {
  it('replaces api key if matched by id', () => {
    store.commit('apiKey/SET_API_KEYS', [key1, key2])

    const updatedKey1 = { ...key1, name: 'updated' }
    store.commit('apiKey/PUSH_API_KEY', updatedKey1)
    expect(store.state.apiKey.apiKeys).toEqual([updatedKey1, key2])

    const updatedKey2 = { ...key2, name: 'updated 2' }
    store.commit('apiKey/PUSH_API_KEY', updatedKey2)
    expect(store.state.apiKey.apiKeys).toEqual([updatedKey1, updatedKey2])
  })

  it('adds key if not matched by id', () => {
    store.commit('apiKey/SET_API_KEYS', [])

    store.commit('apiKey/PUSH_API_KEY', key1)
    expect(store.state.apiKey.apiKeys).toEqual([key1])

    store.commit('apiKey/PUSH_API_KEY', key2)
    expect(store.state.apiKey.apiKeys).toEqual([key1, key2])
  })
})

describe('apiKey/REMOVE_API_KEY', () => {
  it('removes api key', () => {
    store.commit('apiKey/SET_API_KEYS', [key1, key2])

    store.commit('apiKey/REMOVE_API_KEY', key1)
    expect(store.state.apiKey.apiKeys).toEqual([key2])

    store.commit('apiKey/REMOVE_API_KEY', key2)
    expect(store.state.apiKey.apiKeys).toEqual([])
  })

  it('does nothing if key not found', () => {
    store.commit('apiKey/SET_API_KEYS', [key2])

    store.commit('apiKey/REMOVE_API_KEY', key1)
    expect(store.state.apiKey.apiKeys).toEqual([key2])
  })

  it('does nothing if keys blank', () => {
    store.commit('apiKey/REMOVE_API_KEY', key1)
    expect(store.state.apiKey.apiKeys).toEqual([])
  })
})
