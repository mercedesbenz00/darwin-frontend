import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildDatasetItemsCountPayload, buildDatasetPayload } from 'test/unit/factories'
import { bottle, flask } from 'test/unit/fixtures/annotation-class-payloads'

import ModelTrainingSummary from '@/components/ModelCreation/ModelTrainingSummary.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

describe('when no dataset', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
  })

  it('does not load counts', () => {
    shallowMount(ModelTrainingSummary, { localVue, store })
    expect(store.dispatch).not.toHaveBeenCalledWith('neuralModel/loadNewModelTrainingCounts')
  })
})

describe('when no classes', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload({ id: 5 }))
  })

  it('does not load counts', () => {
    shallowMount(ModelTrainingSummary, { localVue, store })
    expect(store.dispatch).not.toHaveBeenCalledWith('neuralModel/loadNewModelTrainingCounts')
  })
})

describe('when dataset and classes', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload({ id: 5 }))
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
  })

  it('loads counts', () => {
    shallowMount(ModelTrainingSummary, { localVue, store })
    expect(store.dispatch).toHaveBeenCalledWith('neuralModel/loadNewModelTrainingCounts')
  })
})

describe('when counts', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', buildDatasetPayload({ id: 5 }))
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
    const counts = buildDatasetItemsCountPayload({ item_count: 1000 })
    store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelTrainingSummary, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders training data', () => {
    const wrapper = shallowMount(ModelTrainingSummary, { localVue, store })
    expect(wrapper.text()).toContain('800')
    expect(wrapper.text()).toContain('100')
  })
})
