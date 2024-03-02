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

import ModelSummary from '@/components/ModelCreation/ModelSummary.vue'
import { installCommonComponents } from '@/plugins/components'
import { ModelType } from '@/utils/wind/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

const dataset = buildDatasetPayload({ id: 1, progress: 0.5 })
const template = buildModelTemplatePayload({ type: ModelType.ObjectDetection })

beforeEach(() => {
  store = createTestStore()
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelSummary, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itEnablesButton = () => {
  it('disables button', () => {
    const wrapper = shallowMount(ModelSummary, { localVue, store })
    expect(wrapper.find('primary-button-stub').attributes('disabled')).toBeFalsy()
  })
}

describe('when valid', () => {
  beforeEach(() => {
    store.commit('dataset/PUSH_REPORT', buildDatasetReportPayload({
      id: dataset.id,
      class_distribution_by_annotation_instance: [
        { id: flask.id, name: flask.name, count: 5000 },
        { id: bottle.id, name: bottle.name, count: 2200 },
        { id: scale.id, name: scale.name, count: 3001 }
      ]
    }))

    store.commit('neuralModel/SET_NEW_MODEL_DATASET', dataset)
    store.commit('neuralModel/SET_NEW_MODEL_TEMPLATE', template)
    store.commit('neuralModel/SET_NEW_MODEL_NAME', 'foo')
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [bottle, flask])
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload()])
    const counts = buildDatasetItemsCountPayload({ item_count: 5001 })
    store.commit('neuralModel/SET_NEW_MODEL_TRAINING_COUNTS', counts)

    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })
  itMatchesSnapshot()
  itEnablesButton()
})

describe('when invalid', () => {
  beforeEach(() => {
    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })

  itMatchesSnapshot()
})
