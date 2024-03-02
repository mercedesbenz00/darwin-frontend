import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainingSessionPayload } from 'test/unit/factories'

import MetricLoader from '@/components/Renderless/MetricLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

it('load metrics for a training session', () => {
  const trainingSession = buildTrainingSessionPayload()

  const propsData = { trainingSession }

  const store = createTestStore()
  shallowMount(MetricLoader, { localVue, propsData, store })

  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/getMetrics', trainingSession)
})
