import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildModelTemplatePayload } from 'test/unit/factories'
import { emitRootStub, rootStubProps } from 'test/unit/testHelpers'

import TemplateSelection from '@/components/ModelCreation/TemplateSelection.vue'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const allDevices = [ModelDevice.CPU, ModelDevice.GPU]
const cpuOnly = [ModelDevice.CPU]
const gpuOnly = [ModelDevice.GPU]

const templates = [ModelType.AutoAnnotation,
  ModelType.Classification,
  ModelType.InstanceSegmentation,
  ModelType.ObjectDetection,
  ModelType.SemanticSegmentation
].flatMap(
  t => [
    buildModelTemplatePayload({ id: `${t}-1}`, type: t, devices: allDevices }),
    buildModelTemplatePayload({ id: `${t}-2}`, type: t, devices: cpuOnly }),
    buildModelTemplatePayload({ id: `${t}-3}`, type: t, devices: gpuOnly })
  ]
)

beforeEach(() => {
  store.commit('neuralModel/SET_MODEL_TEMPLATES', templates)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(TemplateSelection, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot (only one template)', () => {
  store.commit('neuralModel/SET_MODEL_TEMPLATES', [
    buildModelTemplatePayload({
      id: 'fake',
      type: ModelType.Classification,
      devices: [ModelDevice.GPU]
    })
  ])

  const wrapper = shallowMount(TemplateSelection, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

it('builds options from templates filtered by selected type', async () => {
  const wrapper = shallowMount(TemplateSelection, { localVue, store })

  expect(rootStubProps(wrapper, 'options')).toEqual([
    { id: 'instance_segmentation-1}', text: 'Fake Template' },
    { id: 'instance_segmentation-3}', text: 'Fake Template' }
  ])

  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.AutoAnnotation)

  await wrapper.vm.$nextTick()
  expect(rootStubProps(wrapper, 'options')).toEqual([
    { id: 'auto_annotate-1}', text: 'Fake Template' },
    { id: 'auto_annotate-3}', text: 'Fake Template' }

  ])
})

it('sets template on store on selection', async () => {
  const template = buildModelTemplatePayload({
    id: 'fake',
    type: ModelType.Classification,
    devices: [ModelDevice.GPU]
  })

  const anotherTemplate = buildModelTemplatePayload({
    id: 'another',
    type: ModelType.Classification,
    devices: [ModelDevice.GPU]
  })

  store.commit('neuralModel/SET_MODEL_TEMPLATES', [template, anotherTemplate])
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.Classification)

  const wrapper = shallowMount(TemplateSelection, { localVue, store })

  await emitRootStub(wrapper, 'change', template.id)
  expect(store.state.neuralModel.newModelTemplate).toEqual(template)
})

it('preselects template on mount', () => {
  const template = buildModelTemplatePayload({
    id: 'fake',
    type: ModelType.Classification,
    devices: [ModelDevice.GPU]
  })

  store.commit('neuralModel/SET_MODEL_TEMPLATES', [template])
  store.commit('neuralModel/SET_NEW_MODEL_TYPE', ModelType.Classification)

  expect(store.state.neuralModel.newModelTemplate).toBeNull()
  shallowMount(TemplateSelection, { localVue, store })
  expect(store.state.neuralModel.newModelTemplate).toEqual(template)
})
