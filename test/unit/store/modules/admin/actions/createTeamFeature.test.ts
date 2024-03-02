import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAdminTeamPayload, buildAxiosResponse } from 'test/unit/factories'

import { createTeamFeature } from '@/store/modules/admin/actions/createTeamFeature'
import { StoreActionPayload } from '@/store/types'
import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ createTeamFeature: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'createTeamFeature').mockResolvedValue(buildAxiosResponse({ data: '' }))
})

const payload: StoreActionPayload<typeof createTeamFeature> = { teamId: 5, feature: 'TEST_FEATURE' }

it('calls correct api endpoint', async () => {
  await store.dispatch('admin/createTeamFeature', payload)
  expect(backend.createTeamFeature).toHaveBeenCalledWith(payload)
})

it('pushes feature to team', async () => {
  store.commit('admin/PUSH_TEAM', buildAdminTeamPayload({ id: 5 }))
  await store.dispatch('admin/createTeamFeature', payload)
  expect(store.state.admin.teams[0].features).toEqual(['TEST_FEATURE'])
})
