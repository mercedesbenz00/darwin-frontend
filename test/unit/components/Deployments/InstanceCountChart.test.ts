import { shallowMount, createLocalVue } from '@vue/test-utils'
import { ChartOptions } from 'chart.js'
import flushPromises from 'flush-promises'
import moment from 'moment'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import {
  buildRunningSessionInstanceCountPayload,
  buildRunningSessionPayload,
  buildTeamPayload
} from 'test/unit/factories'

import InstanceCountChart from '@/components/Deployments/InstanceCountChart.vue'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  runningSession: RunningSessionPayload
}

let store: ReturnType<typeof createTestStore>

const team = buildTeamPayload({ id: 1, name: 'Team' })

const mocks = {
  $theme: createMockTheme()
}

const runningSession = buildRunningSessionPayload({
  id: '2c965950-c052-4d3a-8bb7-b419bb294812',
  team_id: team.id
})

beforeEach(() => {
  propsData = { runningSession }
  store = createTestStore()
})

describe('no data', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(InstanceCountChart, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('data', () => {
  const instanceCounts = [
    buildRunningSessionInstanceCountPayload({
      available: 1,
      running_session_id: runningSession.id
    }),
    buildRunningSessionInstanceCountPayload({
      available: 99,
      running_session_id: runningSession.id
    })
  ]

  beforeEach(() => {
    store.commit('neuralModel/SET_RUNNING_SESSION_INSTANCE_COUNTS', {
      runningSession,
      data: instanceCounts
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(InstanceCountChart, { localVue, mocks, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

it('loads data on mount', () => {
  shallowMount(InstanceCountChart, { localVue, mocks, propsData, store })
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadRunningSessionInstanceCounts',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'minute',
      runningSession
    })
  )
})

it('loads data on range change', async () => {
  const wrapper = shallowMount(InstanceCountChart, { localVue, mocks, propsData, store })
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
    'neuralModel/loadRunningSessionInstanceCounts',
    expect.objectContaining({
      from: expect.stringContaining('T00:00:00'),
      granularity: 'day',
      runningSession
    })
  )

  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'week')
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadRunningSessionInstanceCounts',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'hour',
      runningSession
    })
  )

  dispatch.mockClear()

  await wrapper.find('tab-selector-stub').vm.$emit('change', 'day')
  expect(store.dispatch).toHaveBeenCalledWith(
    'neuralModel/loadRunningSessionInstanceCounts',
    expect.objectContaining({
      from: expect.stringContaining(':00:00'),
      granularity: 'minute',
      runningSession
    })
  )
})

it('defaults to smallest data timestamp if data does not cover chart fully', async () => {
  const wrapper = shallowMount(InstanceCountChart, { localVue, mocks, propsData, store })
  await flushPromises()

  const expected = moment.utc().startOf('minute').format('YYYY-MM-DDTHH:mm:ss')
  const data = [
    buildRunningSessionInstanceCountPayload({
      reported_for: expected, running_session_id: runningSession.id
    })
  ]
  store.commit('neuralModel/SET_RUNNING_SESSION_INSTANCE_COUNTS', { data, runningSession })
  await wrapper.vm.$nextTick()
  const options = wrapper.find('line-chart-stub').props('options') as ChartOptions
  expect(options.scales!.xAxes![0].ticks!.min).toEqual(expected)
})
