import { shallowMount, createLocalVue } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildInferenceRequestCountPayload,
  buildRunningSessionPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { buildInstanceCountPayload } from 'test/unit/factories/buildInstanceCountPayload'

import DeploymentStats from '@/components/Deployments/DeploymentStats.vue'
import { DeploymentDataRange } from '@/components/Deployments/types'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

// "timezoneless ISO format", since it's used by mocks and passed into the date constructor
const now = '2019-01-31T00:00:00.000Z'
// same format as backend, since it's used as mock backend data
const start = '2019-01-05T00:00:00'

const team = buildTeamPayload({ id: 1, name: 'Team' })

const runningSession = buildRunningSessionPayload({
  id: '2c965950-c052-4d3a-8bb7-b419bb294812',
  team_id: team.id
})

const requests = [
  buildInferenceRequestCountPayload({
    running_session_id: runningSession.id, request_count: 10, success_count: 7, failure_count: 3
  }),
  buildInferenceRequestCountPayload({
    running_session_id: runningSession.id, request_count: 7, success_count: 5, failure_count: 2
  })
]

const instanceCounts = [
  buildInstanceCountPayload({
    running_session_id: runningSession.id, instance_count_cpu: 0, instance_count_gpu: 3, date: start
  }),
  buildInstanceCountPayload({
    running_session_id: runningSession.id, instance_count_cpu: 2, instance_count_gpu: 0, date: start
  })
]

let store: ReturnType<typeof createTestStore>
let propsData: {
  dataRange: DeploymentDataRange
  runningSession: RunningSessionPayload
}

beforeEach(() => {
  // component includes cost computation which is based on the current date
  // the test setup requires us to mock the date to maintain consistency

  advanceTo(now)
  store = createTestStore()
  propsData = {
    dataRange: 'total',
    runningSession
  }

  store.commit('neuralModel/SET_RUNNING_SESSION_REQUEST_COUNTS', {
    runningSession, data: requests
  })
  store.commit('neuralModel/SET_RUNNING_SESSION_INSTANCE_COUNTS', {
    runningSession, data: instanceCounts
  })
})

afterEach(() => clear())

it('matches snapshot', () => {
  const wrapper = shallowMount(DeploymentStats, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when no data', () => {
  store.commit('neuralModel/SET_RUNNING_SESSION_REQUEST_COUNTS', {
    runningSession, data: []
  })
  store.commit('neuralModel/SET_RUNNING_SESSION_INSTANCE_COUNTS', {
    runningSession, data: []
  })

  const wrapper = shallowMount(DeploymentStats, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})
