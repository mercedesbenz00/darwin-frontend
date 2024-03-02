import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildRunningSessionPayload, buildTeamPayload } from 'test/unit/factories'

import { updateModel } from '@/store/modules/neuralModel/actions/updateModel'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ updateRunningSession: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createUnstubbedTestStore>

const runningSession = buildRunningSessionPayload({
  id: 'fake-running-session', trained_model_id: 'trained-model'
})

let payload: StoreActionPayload<typeof updateModel>

const v7 = buildTeamPayload({ id: 7, slug: 'v7' })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
  jest.spyOn(wind, 'updateRunningSession').mockResolvedValue({ data: runningSession })
  payload = {
    autoStop: false,
    minimumInstances: 1,
    maximumInstances: 2,
    runningSession
  }
})

afterEach(() => {
  (wind.updateRunningSession as jest.Mock).mockReset()
})

it('raises if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('neuralModel/updateModel', payload)).rejects.toThrow()
})

it('sends request', async () => {
  await store.dispatch('neuralModel/updateModel', payload)
  const expected: Parameters<typeof wind.updateRunningSession>[0] = {
    autoStop: false,
    expand: ['meta.classes', 'meta.num_instances_available', 'meta.num_instances_starting'],
    min: 1,
    max: 2,
    teamId: 7,
    runningSessionId: 'fake-running-session'
  }
  expect(wind.updateRunningSession).toHaveBeenCalledWith(expected)
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/updateModel', payload)
  expect(data).toEqual(runningSession)
})

it('pushes running session to store on success', async () => {
  jest.spyOn(store, 'commit')
  expect(store.state.neuralModel.runningSessions).toEqual([])
  await store.dispatch('neuralModel/updateModel', payload)
  expect(store.state.neuralModel.runningSessions).toEqual([runningSession])
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'updateRunningSession').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/updateModel', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
