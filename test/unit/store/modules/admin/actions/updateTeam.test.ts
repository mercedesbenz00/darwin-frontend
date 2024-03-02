import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAdminTeamPayload, buildAxiosResponse } from 'test/unit/factories'

import { updateTeam } from '@/store/modules/admin/actions/updateTeam'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateTeamAsAdmin: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'admin/updateTeam'

const payload: StoreActionPayload<typeof updateTeam> = {
  disabled: false,
  managed_status: 'partner',
  name: 'Foo',
  neural_models_enabled: true,
  note: 'lorem ipsum',
  slug: 'foo',
  teamId: 2
}

const data = buildAdminTeamPayload({
  disabled: false,
  id: 2,
  managed_status: 'partner',
  name: 'Foo',
  neural_models_enabled: true,
  note: 'lorem ipsum',
  slug: 'foo'
})

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'updateTeamAsAdmin').mockResolvedValue(buildAxiosResponse({ data }))
})

afterEach(() => {
  (backend.updateTeamAsAdmin as jest.Mock).mockReset()
})

it('calls correct backend endpoint', async () => {
  await store.dispatch(ACTION, payload)
  expect(backend.updateTeamAsAdmin).toHaveBeenCalledWith(payload)
})

it('returns backend response', async () => {
  const response = await store.dispatch(ACTION, payload)
  expect(response.data).toEqual(data)
})

it('returns parsed error on failure', async () => {
  jest.spyOn(backend, 'updateTeamAsAdmin').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch(ACTION, payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
