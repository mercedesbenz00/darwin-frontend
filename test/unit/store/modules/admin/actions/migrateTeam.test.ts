import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse } from 'test/unit/factories'

import { migrateTeam } from '@/store/modules/admin/actions/migrateTeam'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ migrateTeam: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'migrateTeam').mockResolvedValue(buildAxiosResponse({ data: '' }))
})

const payload: StoreActionPayload<typeof migrateTeam> = { teamId: 5, feature: 'TEST_FEATURE' }

it('calls correct api endpoint', async () => {
  await store.dispatch('admin/migrateTeam', payload)
  expect(backend.migrateTeam).toHaveBeenCalledWith(payload)
})
