import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildMetricPayload, buildTeamPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import { getMetrics } from '@/store/modules/neuralModel/actions/getMetrics'
import { StoreActionPayload } from '@/store/types'
import * as wind from '@/utils/wind'

jest.mock('@/utils/wind', () => ({ getMetrics: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>
const currentTeam = buildTeamPayload({})
const someTrainingSession = buildTrainingSessionPayload({ id: 'some-training-session' })
const someMetrics = [buildMetricPayload({ training_session_id: 'some-training-session' })]
const payload: StoreActionPayload<typeof getMetrics> = someTrainingSession

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', currentTeam)
  jest.spyOn(wind, 'getMetrics').mockResolvedValue({ data: someMetrics })
})

it('sends request', async () => {
  await store.dispatch('neuralModel/getMetrics', payload)
  expect(wind.getMetrics).toHaveBeenCalledWith({ teamId: currentTeam.id, trainingSessionId: someTrainingSession.id })
})

it('returns raw data', async () => {
  const { data } = await store.dispatch('neuralModel/getMetrics', payload)
  expect(data).toEqual(someMetrics)
})

it('pushes deserialized data to store', async () => {
  await store.dispatch('neuralModel/getMetrics', payload)
  expect(store.state.neuralModel.metrics).toEqual({ 'some-training-session': someMetrics })
})

it('responds with parsed error on failure', async () => {
  jest.spyOn(wind, 'getMetrics').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })

  const { error } = await store.dispatch('neuralModel/getMetrics', payload)
  expect(error).toEqual({ message: 'foo', isValidationError: false })
})
