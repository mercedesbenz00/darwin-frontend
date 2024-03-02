import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { buildDatasetItemPayload, buildDatasetPayload } from 'test/unit/factories'
import { flask } from 'test/unit/fixtures/annotation-class-payloads'

import ModelDatasetSetup from '@/components/ModelCreation/ModelDatasetSetup.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', stubDirectiveWithAttribute)
installCommonComponents(localVue)

const mocks = { $theme: createMockTheme() }

let store: ReturnType<typeof createTestStore>

const sfh = buildDatasetPayload({ id: 5 })

beforeEach(() => {
  store = createTestStore()
})

const model = {
  continueButton: 'primary-button-stub'
}

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when no sample items', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [flask])
    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })

  itMatchesSnapshot()

  it('disables "continue" button', () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()
  })
})

describe('when no selected dataset', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [flask])
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload({ id: 1 })])
    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })

  itMatchesSnapshot()

  it('disables "continue" button', () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()
  })
})

describe('when no selected classes', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload({ id: 1 })])
    store.commit('neuralModel/VALIDATE_NEW_MODEL')
  })

  itMatchesSnapshot()

  it('disables "continue" button', () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    expect(wrapper.find(model.continueButton).attributes('disabled')).toBeTruthy()
  })
})

describe('when data valid', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_NEW_MODEL_DATASET', sfh)
    store.commit('neuralModel/SET_NEW_MODEL_SELECTED_CLASSES', [flask])
    store.commit('neuralModel/PUSH_NEW_MODEL_SAMPLE_ITEMS', [buildDatasetItemPayload({ id: 1 })])
  })

  itMatchesSnapshot()

  it('enables "continue" button', () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    expect(wrapper.find(model.continueButton).attributes('disabled')).toBeFalsy()
  })

  it('emits continue', async () => {
    const wrapper = shallowMount(ModelDatasetSetup, { localVue, mocks, store })
    await wrapper.find(model.continueButton).vm.$emit('click')
    expect(wrapper.emitted().continue!.length).toBe(1)
  })
})
