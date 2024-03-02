import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { buildMetricPayload, buildTrainingSessionPayload } from 'test/unit/factories'

import LossChart from '@/components/Models/MetricCharts/LossChart.vue'
import { TrainingSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const $theme = createMockTheme()
const mocks = { $theme }

const trainingSession = buildTrainingSessionPayload()
const metrics = [buildMetricPayload({ training_session_id: trainingSession.id })]

let store: ReturnType<typeof createTestStore>
let propsData: {
  trainingSession: TrainingSessionPayload
}

beforeEach(() => {
  store = createTestStore()
  propsData = { trainingSession }

  store.commit('neuralModel/PUSH_METRICS', metrics)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(LossChart, { localVue, mocks, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches data', () => {
  const wrapper = shallowMount(LossChart, { localVue, mocks, propsData, store })
  expect(wrapper.find('line-chart-stub').props('chartData')).toEqual({
    datasets: [
      expect.objectContaining({ data: metrics[0].data, label: metrics[0].name })
    ]
  })
})
