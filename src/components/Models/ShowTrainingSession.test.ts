import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildMetricPayload, buildTeamPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import ShowTrainingSession from '@/components/Models/ShowTrainingSession.vue'
import { TrainingSessionPayload } from '@/store/types'

jest.mock('@/utils/wind', () => ({ getMetrics: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})

const $theme = createMockTheme()
const mocks = { $theme }

const currentTeam = buildTeamPayload({})
const someTrainingSession = buildTrainingSessionPayload({ id: 'some-training-session' })
const someMetrics = [
  buildMetricPayload({ training_session_id: 'some-training-session' }),
  buildMetricPayload({ data: [{ x: 1, y: 59231 }], name: 'eta', training_session_id: 'some-training-session' })
]

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainingSession: TrainingSessionPayload
}

beforeEach(() => {
  store = createTestStore()
  propsData = {
    trainingSession: someTrainingSession
  }

  store.commit('team/SET_CURRENT_TEAM', currentTeam)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(ShowTrainingSession, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot (with eta)', () => {
  store.commit('neuralModel/PUSH_METRICS', someMetrics)
  const wrapper = shallowMount(ShowTrainingSession, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
