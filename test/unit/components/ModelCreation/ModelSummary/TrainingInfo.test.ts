import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetItemPayload,
  buildDatasetItemsCountPayload,
  buildDatasetPayload,
  buildDatasetReportPayload,
  buildModelTemplatePayload
} from 'test/unit/factories'
import { bottle, flask, scale } from 'test/unit/fixtures/annotation-class-payloads'

import TrainingInfo from '@/components/ModelCreation/ModelSummary/TrainingInfo.vue'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

const dataset = buildDatasetPayload({ id: 1, progress: 0.5 })
const template = buildModelTemplatePayload({ type: ModelType.ObjectDetection })

beforeEach(() => {
  store = createTestStore()
  store.commit('neuralModel/SET_NEW_MODEL_DATASET', dataset)
  store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
  store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
  store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
  store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload()])
  const counts = buildDatasetItemsCountPayload({ item_count: 5001 })
  store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)
  store.commit('neuralModel/SET_NEW_MODEL_CLASS_COUNTS', buildDatasetReportPayload({
    id: dataset.id,
    class_distribution_by_annotation_instance: [
      { id: flask.id, name: flask.name, count: 5000 },
      { id: bottle.id, name: bottle.name, count: 2200 },
      { id: scale.id, name: scale.name, count: 3001 }
    ]
  }))
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TrainingInfo, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('renders model type', () => {
  const wrapper = shallowMount(TrainingInfo, { localVue, store })
  expect(wrapper.text()).toContain('Object Detection Model')
})

it('renders class counts', async () => {
  const wrapper = shallowMount(TrainingInfo, { localVue, store })
  expect(wrapper.text()).toContain('2 Classes')

  store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle])
  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('1 Class')
})

it('renders instance counts', async () => {
  const wrapper = shallowMount(TrainingInfo, { localVue, store })
  expect(wrapper.text()).toContain('7,200 Instances')

  store.commit('neuralModel/SET_NEW_MODEL_CLASS_COUNTS', buildDatasetReportPayload({
    id: dataset.id,
    class_distribution_by_annotation_instance: [
      { id: flask.id, name: flask.name, count: 1 },
      { id: bottle.id, name: bottle.name, count: 0 }
    ]
  }))

  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('1 Instance')
})

it('renders item counts', async () => {
  const wrapper = shallowMount(TrainingInfo, { localVue, store })
  expect(wrapper.text()).toContain('5,001 Images')

  const counts = buildDatasetItemsCountPayload({ item_count: 1 })
  store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)

  await wrapper.vm.$nextTick()

  expect(wrapper.text()).toContain('1 Image')
})
