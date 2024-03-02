import { shallowMount, createLocalVue } from '@vue/test-utils'
import { ChartOptions } from 'chart.js'
import flushPromises from 'flush-promises'
import moment from 'moment'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildInferenceRequestCountPayload,
  buildRunningSessionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import ModelRequestChart from '@/components/Deployments/ModelRequestChart.vue'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

const team = buildTeamPayload({ id: 1, name: 'Team' })

const runningSession = buildRunningSessionPayload({
  id: '2c965950-c052-4d3a-8bb7-b419bb294812',
  team_id: team.id
})
let propsData: {
  runningSession: RunningSessionPayload
}

let store: ReturnType<typeof createTestStore>

const mocks = { $theme: createMockTheme() }

beforeEach(() => {
  propsData = { runningSession }
  store = createTestStore()
})

describe('no data', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelRequestChart, { localVue, mocks, store, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('data', () => {
  const modelRequests = [
    buildInferenceRequestCountPayload({
      running_session_id: runningSession.id, request_count: 10, success_count: 7, failure_count: 3
    }),
    buildInferenceRequestCountPayload({
      running_session_id: runningSession.id, request_count: 7, success_count: 5, failure_count: 2
    })
  ]

  beforeEach(() => {
    store.commit('neuralModel/SET_RUNNING_SESSION_REQUEST_COUNTS', {
      runningSession,
      data: modelRequests
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelRequestChart, { localVue, mocks, store, propsData })
    expect(wrapper).toMatchSnapshot()
  })
})

it('loads data on mount', () => {
  shallowMount(ModelRequestChart, { localVue, mocks, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadInferenceRequests',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'minute',
      runningSession
    })
  )
})

it('loads data on range change', async () => {
  const wrapper = shallowMount(ModelRequestChart, { localVue, mocks, propsData, store })
  const dispatch = jest.spyOn(store, 'dispatch')
  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'total')

  expect.objectContaining({
    from: expect.stringContaining('T00:00:00'),
    granularity: 'day',
    runningSession
  })

  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'month')
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadInferenceRequests',
    expect.objectContaining({
      from: expect.stringContaining('T00:00:00'),
      granularity: 'day',
      runningSession
    })
  )

  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'week')
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadInferenceRequests',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'hour',
      runningSession
    })
  )

  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'day')
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadInferenceRequests',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'minute',
      runningSession
    })
  )
})

it('defaults to smallest data timestamp if data does not cover chart fully', async () => {
  const wrapper = shallowMount(ModelRequestChart, { localVue, mocks, propsData, store })
  await flushPromises()

  const expected = moment.utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss')
  const data = [
    buildInferenceRequestCountPayload({ date: expected, running_session_id: runningSession.id })
  ]
  store.commit('neuralModel/SET_RUNNING_SESSION_REQUEST_COUNTS', { data, runningSession })
  await wrapper.vm.$nextTick()
  const options = wrapper.find('line-chart-stub').props('options') as ChartOptions
  expect(options.scales!.xAxes![0].ticks!.min).toEqual(expected)
})
