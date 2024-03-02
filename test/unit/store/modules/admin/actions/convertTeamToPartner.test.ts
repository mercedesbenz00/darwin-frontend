import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAdminTeamPayload, buildAxiosResponse } from 'test/unit/factories'
import { fakeError } from 'test/unit/responseStubs'

import { convertTeamToPartner } from '@/store/modules/admin/actions/convertTeamToPartner'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ updateTeamAsAdmin: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const ACTION = 'admin/convertTeamToPartner'

const payload: StoreActionPayload<typeof convertTeamToPartner> = {
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

  const expected: Parameters<typeof backend.updateTeamAsAdmin>[0] = {
    teamId: 2,
    managed_status: 'partner'
  }

  expect(backend.updateTeamAsAdmin).toHaveBeenCalledWith(expected)
})

it('returns backend response', async () => {
  const response = await store.dispatch(ACTION, payload)
  expect(response).toEqual(expect.objectContaining({ data }))
})

it('returns parsed error on failure', async () => {
  jest.spyOn(backend, 'updateTeamAsAdmin').mockResolvedValue({ error: fakeError })
  const { error } = await store.dispatch(ACTION, payload)
  expect(error).toEqual(fakeError)
})
