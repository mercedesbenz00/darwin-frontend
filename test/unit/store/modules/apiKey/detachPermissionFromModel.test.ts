import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildApiKeyPayload, buildRunningSessionPayload, buildTrainedModelPayload, buildAxiosResponse } from 'test/unit/factories'

import { detachPermissionFromModel } from '@/store/modules/apiKey/actions/detachPermissionFromModel'
import { ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

let payload: StoreActionPayload<typeof detachPermissionFromModel>
let response: ApiKeyPayload

jest.mock('@/utils/backend', () => ({ updateApiKey: jest.fn() }))

describe('for running session', () => {
  const permissions: ApiKeyPermission[] = [['run_inference', 'running_session:fake-id']]
  beforeEach(() => {
    store = createUnstubbedTestStore()
    payload = {
      apiKey: buildApiKeyPayload({ permissions }),
      runningSession: buildRunningSessionPayload({ id: 'fake-id' })
    }

    response = { ...payload.apiKey, permissions }

    jest.spyOn(backend, 'updateApiKey').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    (backend.updateApiKey as jest.Mock).mockReset()
  })

  it('sends request to api', async () => {
    await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(backend.updateApiKey).toHaveBeenCalledWith({
      apiKeyId: payload.apiKey.id,
      permissions: []
    })
  })

  it('returns data retrieved from endpoint', async () => {
    const { data } = await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(data).toEqual(response)
  })

  it('commits dataset to store', async () => {
    await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(store.state.apiKey.apiKeys).toEqual([response])
  })

  it('returns error', async () => {
    jest.spyOn(backend, 'updateApiKey').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
    const response = await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(response.error).toEqual({ message: 'foo', isValidationError: false })
  })
})

describe('for trained_model', () => {
  const permissions: ApiKeyPermission[] = [['run_inference', 'trained_model:fake-id']]
  beforeEach(() => {
    store = createUnstubbedTestStore()
    payload = {
      apiKey: buildApiKeyPayload({ permissions }),
      trainedModel: buildTrainedModelPayload({ id: 'fake-id' })
    }

    response = { ...payload.apiKey, permissions: [] }

    jest.spyOn(backend, 'updateApiKey').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    (backend.updateApiKey as jest.Mock).mockReset()
  })

  it('sends request to api', async () => {
    await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(backend.updateApiKey).toHaveBeenCalledWith({
      apiKeyId: payload.apiKey.id,
      permissions: []
    })
  })

  it('returns data retrieved from endpoint', async () => {
    const { data } = await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(data).toEqual(response)
  })

  it('commits dataset to store', async () => {
    await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(store.state.apiKey.apiKeys).toEqual([response])
  })

  it('returns error', async () => {
    jest.spyOn(backend, 'updateApiKey').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
    const response = await store.dispatch('apiKey/detachPermissionFromModel', payload)
    expect(response.error).toEqual({ message: 'foo', isValidationError: false })
  })
})
