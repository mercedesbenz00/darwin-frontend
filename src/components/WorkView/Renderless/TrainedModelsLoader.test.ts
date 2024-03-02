import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import TrainedModelsLoader from '@/components/WorkView/Renderless/TrainedModelsLoader'

const localVue = createLocalVue()
localVue.use(Vuex)

it('load trained models', () => {
  const store = createTestStore()
  shallowMount(TrainedModelsLoader, { localVue, store })
  expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadTrainedModels')
})
