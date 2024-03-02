import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ syncApiKeys: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'syncApiKeys')
    .mockResolvedValue(buildAxiosResponse({ data: 'foo' }))
})

afterEach(() => {
  (backend.syncApiKeys as jest.Mock).mockReset()
})

it('calls correct backend endpoint', async () => {
  await store.dispatch('admin/syncApiKeys')
  expect(backend.syncApiKeys).toHaveBeenCalled()
})

it('returns backend response', async () => {
  const response = await store.dispatch('admin/syncApiKeys')
  expect(response.data).toEqual('foo')
})

it('returns parsed error on failure', async () => {
  jest.spyOn(backend, 'syncApiKeys').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('admin/syncApiKeys')
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
