import { createLocalVue, shallowMount } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildAnnotationClassPayload,
  buildDatasetPayload,
  buildModelStageTemplatePayload,
  buildRunningSessionPayload,
  buildTrainingClass
} from 'test/unit/factories'

import ModelStage from '@/components/DatasetSettings/ModelStage/ModelStage.vue'
import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload, ModelStageTemplatePayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal, { dynamic: true })
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let propsData: {
  dataset: DatasetPayload
  deletable: boolean
  stage: ModelStageTemplatePayload
}
const model = {
  autoInstantiate: 'auto-instantiate-stub',
  deleteButton: 'delete-button-stub',
  nameField: 'stage-title-stub',
  sessionDropdown: 'dropdown-stub',
  classMapping: 'class-mapping-stub'
}

beforeEach(() => {
  const boxotron = buildRunningSessionPayload({
    id: 'foo',
    name: 'Box-o-Tron 2000',
    meta: {
      classes: [
        buildTrainingClass({ id: 'model-1', darwin_id: 11, name: 'Box11', type: 'bounding_box' }),
        buildTrainingClass({ id: 'model-2', darwin_id: 22, name: 'Box22', type: 'bounding_box' })
      ],
      num_instances_available: 1,
      num_instances_starting: 0
    }
  })

  const catFinder = buildRunningSessionPayload({ id: 'bar', name: 'Cat Finder' })
  store = createTestStore()
  store.commit('neuralModel/SET_RUNNING_SESSIONS', [boxotron, catFinder])

  propsData = {
    dataset: buildDatasetPayload({ id: 7 }),
    deletable: false,
    stage: buildModelStageTemplatePayload({
      id: 5,
      stage_number: 3,
      name: 'AI Model',
      metadata: {}
    })
  }
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when deletable', () => {
  beforeEach(() => {
    propsData.deletable = true
  })

  itMatchesSnapshot()

  it('renders delete button', () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    expect(wrapper.find(model.deleteButton).exists()).toBeTruthy()
  })

  it('emits delete', async () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    await wrapper.find(model.deleteButton).vm.$emit('click')
    expect(wrapper.emitted().delete!.length).toEqual(1)
  })
})

describe('when not deletable', () => {
  beforeEach(() => {
    propsData.deletable = false
  })

  itMatchesSnapshot()

  it('does not render delete button', () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    expect(wrapper.find(model.deleteButton).exists()).toBeFalsy()
  })
})

describe('when running session selected', () => {
  beforeEach(() => {
    propsData.stage.metadata.running_session_id = store.state.neuralModel.runningSessions[0].id
  })
  itMatchesSnapshot()
})

it('binds name', async () => {
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.vm.$nextTick()
  expect(wrapper.find(model.nameField).props('value')).toEqual('AI Model')
})

it('updates name change', async () => {
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.find(model.nameField).vm.$emit('change', 'New name')
  expect(wrapper.find(model.nameField).props('value')).toEqual('New name')
})

it('emits name change', async () => {
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.find(model.nameField).vm.$emit('change', 'New name')
  expect(wrapper.emitted().change![0]).toEqual(
    [expect.objectContaining({ name: 'New name' })]
  )
})

it('binds selected session', async () => {
  propsData.stage = {
    ...propsData.stage,
    metadata: { ...propsData.stage.metadata, running_session_id: 'foo' }
  }
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.vm.$nextTick()

  expect(wrapper.find(model.sessionDropdown).props('value'))
    .toEqual(expect.objectContaining({ id: 'foo' }))
})

it('updates selection change', async () => {
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })

  await wrapper.find(model.sessionDropdown).vm.$emit('input', { id: 'foo' })

  expect(wrapper.find(model.sessionDropdown).props('value'))
    .toEqual(expect.objectContaining({ id: 'foo' }))
})

it('emits session selection change', async () => {
  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.find(model.sessionDropdown).vm.$emit('input', { id: 'bar' })

  expect(wrapper.emitted().change![0]).toEqual([
    expect.objectContaining({ metadata: expect.objectContaining({ running_session_id: 'bar' }) })
  ])
})

it('binds class mapping', async () => {
  const boxotron = store.state.neuralModel.runningSessions[0]
  const mappedStage = {
    ...propsData.stage,
    metadata: {
      ...propsData.stage.metadata,
      running_session_id: boxotron.id,
      class_mapping: [{ annotation_class_id: 1, model_class_label: 'Box11' }]
    }
  }
  propsData.stage = mappedStage

  const randomClass = buildAnnotationClassPayload({
    id: 1,
    datasets: [{ id: propsData.dataset.id }]
  })

  store.commit('aclass/SET_CLASSES', [randomClass])

  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.vm.$nextTick()

  expect(wrapper.find(model.classMapping).props('runningSession')).toEqual(boxotron)
  expect(wrapper.find(model.classMapping).props('stage')).toEqual(mappedStage)
  expect(wrapper.find(model.classMapping).props('annotationClasses')).toEqual([randomClass])
})

it('emits change on class mapping confirm', async () => {
  const boxotron = store.state.neuralModel.runningSessions[0]
  const mappedStage = {
    ...propsData.stage,
    metadata: {
      ...propsData.stage.metadata,
      running_session_id: boxotron.id,
      class_mapping: [{ annotation_class_id: 1, model_class_label: 'Box22' }]
    }
  }
  propsData.stage = mappedStage

  const randomClass = buildAnnotationClassPayload({ id: 1 })

  store.commit('aclass/SET_CLASSES', [randomClass])

  const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
  await wrapper.vm.$nextTick()
  await wrapper.find(model.classMapping).vm.$emit('confirm', [
    { annotationClass: randomClass, modelClass: boxotron.meta.classes[0] },
    { annotationClass: randomClass, modelClass: boxotron.meta.classes[1] }
  ])

  expect(wrapper.emitted().change![0]).toEqual([
    expect.objectContaining({
      metadata: expect.objectContaining({
        class_mapping: [
          { annotation_class_id: 1, model_class_label: 'Box11' },
          { annotation_class_id: 1, model_class_label: 'Box22' }
        ]
      })
    })
  ])
})

describe('when first stage', () => {
  beforeEach(() => {
    propsData.stage.stage_number = 1
  })

  itMatchesSnapshot()

  it('renders auto-instantiate UI', () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    expect(wrapper.find('auto-instantiate-stub').exists()).toBe(true)
  })

  it('binds auto-instantiate', async () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    expect(wrapper.find(model.autoInstantiate).props('value')).toBe(false)
    const newStage = {
      ...propsData.stage,
      metadata: { ...propsData.stage.metadata, auto_instantiate: true }
    }
    await wrapper.setProps({ stage: newStage })
    expect(wrapper.find(model.autoInstantiate).props('value')).toBe(true)
  })

  it('emits auto-instantiate change', async () => {
    const wrapper = shallowMount(ModelStage, { localVue, propsData, store })
    await wrapper.find(model.autoInstantiate).vm.$emit('change')
    expect(wrapper.emitted().change![0]).toEqual([
      expect.objectContaining({ metadata: expect.objectContaining({ auto_instantiate: true }) })
    ])
  })
})
