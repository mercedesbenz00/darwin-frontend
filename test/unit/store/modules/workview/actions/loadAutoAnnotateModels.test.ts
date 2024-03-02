import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'

import loadAutoAnnotateModels from '@/store/modules/workview/actions/loadAutoAnnotateModels'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ loadRunningSessions: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>
let params: StoreActionPayload<typeof loadAutoAnnotateModels>
const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()

  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'loadRunningSessions').mockResolvedValue({ data: [] })
})

afterEach(() => {
  (wind.loadRunningSessions as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('workview/loadAutoAnnotateModels')).rejects.toThrow()
})

it('calls correct backend endpoint', async () => {
  await store.dispatch('workview/loadAutoAnnotateModels', params)
  expect(wind.loadRunningSessions).toHaveBeenCalledWith({ includePublic: true, teamId: 7, type: 'auto_annotate' })
})

it('calls correct backend endpoint (MODEL_TOOL)', async () => {
  store.commit('features/SET_FEATURES', [{ enabled: true, name: 'MODEL_TOOL' }])
  await store.dispatch('workview/loadAutoAnnotateModels', params)
  expect(wind.loadRunningSessions).toHaveBeenCalledWith({
    expand: ['meta.classes', 'meta.num_instances_available'],
    includePublic: true,
    teamId: 7
  })
})

it('returns parsed error on failure', async () => {
  jest.spyOn(wind, 'loadRunningSessions').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  const { error } = await store.dispatch('workview/loadAutoAnnotateModels', params)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
