import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildApiKeyPayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload,
  buildAxiosResponse
} from 'test/unit/factories'

import { createForModel } from '@/store/modules/apiKey/actions/createForModel'
import { ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
})

let payload: StoreActionPayload<typeof createForModel>
let response: ApiKeyPayload

jest.mock('@/utils/backend', () => ({ createApiKey: jest.fn() }))

describe('for running session', () => {
  const permissions: ApiKeyPermission[] = [['run_inference', 'running_session:fake-id']]

  beforeEach(() => {
    store = createUnstubbedTestStore()
    payload = {
      name: 'For running session',
      runningSession: buildRunningSessionPayload({ id: 'fake-id' }),
      teamId: 5
    }

    response = buildApiKeyPayload({
      name: payload.name,
      permissions,
      team_id: payload.teamId
    })

    jest.spyOn(backend, 'createApiKey').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    (backend.createApiKey as jest.Mock).mockReset()
  })

  it('sends request to api', async () => {
    await store.dispatch('apiKey/createForModel', payload)
    expect(backend.createApiKey).toHaveBeenCalledWith({
      name: payload.name,
      permissions,
      teamId: 5
    })
  })

  it('returns data retrieved from endpoint', async () => {
    const { data } = await store.dispatch('apiKey/createForModel', payload)
    expect(data).toEqual(response)
  })

  it('commits dataset to store', async () => {
    await store.dispatch('apiKey/createForModel', payload)
    expect(store.state.apiKey.apiKeys).toEqual([response])
  })

  it('returns error', async () => {
    jest.spyOn(backend, 'createApiKey').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
    const response = await store.dispatch('apiKey/createForModel', payload)
    expect(response.error).toEqual({ message: 'foo', isValidationError: false })
  })
})

describe('for trained_model', () => {
  const permissions: ApiKeyPermission[] = [['run_inference', 'trained_model:fake-id']]
  beforeEach(() => {
    store = createUnstubbedTestStore()
    payload = {
      name: 'For trained model',
      teamId: 5,
      trainedModel: buildTrainedModelPayload({ id: 'fake-id' })
    }

    response = buildApiKeyPayload({
      name: payload.name,
      permissions,
      team_id: payload.teamId
    })

    jest.spyOn(backend, 'createApiKey').mockResolvedValue(buildAxiosResponse({ data: response }))
  })

  afterEach(() => {
    (backend.createApiKey as jest.Mock).mockReset()
  })

  it('sends request to api', async () => {
    await store.dispatch('apiKey/createForModel', payload)
    expect(backend.createApiKey).toHaveBeenCalledWith({
      name: payload.name,
      permissions,
      teamId: 5
    })
  })

  it('returns data retrieved from endpoint', async () => {
    const { data } = await store.dispatch('apiKey/createForModel', payload)
    expect(data).toEqual(response)
  })

  it('commits dataset to store', async () => {
    await store.dispatch('apiKey/createForModel', payload)
    expect(store.state.apiKey.apiKeys).toEqual([response])
  })

  it('returns error', async () => {
    jest.spyOn(backend, 'createApiKey').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
    const response = await store.dispatch('apiKey/createForModel', payload)
    expect(response.error).toEqual({ message: 'foo', isValidationError: false })
  })
})
