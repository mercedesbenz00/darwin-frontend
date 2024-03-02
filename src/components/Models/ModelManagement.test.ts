import { createLocalVue, shallowMount, RouterLinkStub } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload,
  buildTrainingSessionPayload
} from 'test/unit/factories'
import { Gallery } from 'test/unit/stubs'

import ModelManagement from '@/components/Models/ModelManagement.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)

const stubs = { 'router-link': RouterLinkStub, Gallery }

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const model = buildTrainedModelPayload({ id: 'a' })

  const autoAnnotateModel = buildTrainedModelPayload({
    id: 'z', model_template: buildModelTemplatePayload({ type: ModelType.AutoAnnotation })
  })

  store.commit('neuralModel/SET_TRAINED_MODELS', [model, autoAnnotateModel])

  const session = buildTrainingSessionPayload({ id: 'b' })
  store.commit('neuralModel/SET_TRAINING_SESSIONS', [session])

  const runningSession = buildRunningSessionPayload({ id: 'c' })
  const publicRunningSession = buildRunningSessionPayload({ access_level: 'public', id: 'd', trained_model_id: model.id })
  const autoAnnotateRunningSession = buildRunningSessionPayload({ id: 'e', trained_model_id: autoAnnotateModel.id })
  store.commit('neuralModel/SET_RUNNING_SESSIONS', [runningSession, publicRunningSession, autoAnnotateRunningSession])

  const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders trained models without associated gust models as is', () => {
  const model = buildTrainedModelPayload({ id: 'a' })
  store.commit('neuralModel/SET_TRAINED_MODELS', [model])

  const runningSession = buildRunningSessionPayload({ id: 'c', trained_model_id: 'a' })
  store.commit('neuralModel/SET_RUNNING_SESSIONS', [runningSession])

  const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
  expect(wrapper.findAll('model-list-item-stub').length).toEqual(1)
  expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual('c')
})

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })
}

describe('when deploying', () => {
  beforeEach(() => {
    store.commit('neuralModel/SELECT_TRAINED_MODEL', buildTrainedModelPayload({}))
  })

  itMatchesSnapshot()

  it('renders deploy settings', () => {
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
    expect(wrapper.find('deploy-settings-stub').exists()).toBe(true)
  })
})

describe('when updating', () => {
  beforeEach(() => {
    store.commit('neuralModel/SELECT_RUNNING_SESSION', buildRunningSessionPayload({}))
  })

  itMatchesSnapshot()

  it('renders update settings', () => {
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
    expect(wrapper.find('update-settings-stub').exists()).toBe(true)
  })
})

describe('sorting from header', () => {
  it('sorts by name', async () => {
    const models = [
      buildTrainedModelPayload({ name: 'A Model' }),
      buildTrainedModelPayload({ name: 'B Model' })
    ]

    store.commit('neuralModel/SET_TRAINED_MODELS', models)
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'name', 'ascending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(models[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(models[1].id)

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'name', 'descending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(models[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(models[1].id)
  })

  it('sorts by dataset', async () => {
    const sessions = [
      buildTrainingSessionPayload({ dataset_identifier: 'v7/a' }),
      buildTrainingSessionPayload({ dataset_identifier: 'v7/b' })
    ]

    store.commit('neuralModel/SET_TRAINING_SESSIONS', sessions)
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'dataset', 'ascending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(sessions[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(sessions[1].id)

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'dataset', 'descending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(sessions[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(sessions[1].id)
  })

  it('filters out stopped training sessions', () => {
    const sessions = [
      buildTrainingSessionPayload({ dataset_identifier: 'v7/a' }),
      buildTrainingSessionPayload({ dataset_identifier: 'v7/b' }),

      buildTrainingSessionPayload({
        dataset_identifier: 'v7/c',
        gust: {
          current_running_session_id: null,
          id: 'c',
          mode: 'train',
          status: 'stopped'
        },
        status: 'completed'
      })
    ]

    store.commit('neuralModel/SET_TRAINING_SESSIONS', sessions)
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })

    expect(wrapper.findAll('model-list-item-stub').length).toEqual(2)
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(sessions[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(sessions[1].id)
  })

  it('sorts by eta date', async () => {
    const models = [
      buildTrainedModelPayload({ inserted_at: '2000-01-01T00:00:00' }),
      buildTrainedModelPayload({ inserted_at: '2010-01-01T00:00:00' })
    ]

    store.commit('neuralModel/SET_TRAINED_MODELS', models)
    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'date', 'ascending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(models[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(models[1].id)

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'date', 'descending')
    expect(wrapper.findAll('model-list-item-stub').at(0).props('model').id).toEqual(models[0].id)
    expect(wrapper.findAll('model-list-item-stub').at(1).props('model').id).toEqual(models[1].id)
  })

  it('sorts by status', async () => {
    // we give ids which match the record's status, allowing us to
    // directly assert on alphabetical sorting

    const start = buildTrainedModelPayload({ id: 'start' })
    store.commit('neuralModel/SET_TRAINED_MODELS', [start])

    const training = buildTrainingSessionPayload({ id: 'training' })
    store.commit('neuralModel/SET_TRAINING_SESSIONS', [training])

    const stopping = buildRunningSessionPayload({
      id: 'stopping',
      meta: { classes: [], num_instances_available: 1, num_instances_starting: 0 },
      max: 0
    })

    const running = buildRunningSessionPayload({
      id: 'running',
      meta: { classes: [], num_instances_available: 1, num_instances_starting: 0 },
      max: 1
    })

    const starting = buildRunningSessionPayload({
      id: 'starting',
      meta: { classes: [], num_instances_available: 0, num_instances_starting: 1 },
      max: 1
    })

    store.commit('neuralModel/SET_RUNNING_SESSIONS', [stopping, running, starting])

    const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'status', 'ascending')
    expect(wrapper.findAll('model-list-item-stub').wrappers.map(w => w.props('model').id)).toEqual([
      'running', 'start', 'starting', 'stopping', 'training'
    ])

    await wrapper.find('model-list-header-stub').vm.$emit('sort', 'status', 'descending')
    expect(wrapper.findAll('model-list-item-stub').wrappers.map(w => w.props('model').id)).toEqual([
      'training', 'stopping', 'starting', 'start', 'running'
    ])
  })
})

it('renders model channel subscriber', () => {
  const wrapper = shallowMount(ModelManagement, { localVue, store, stubs })
  expect(wrapper.find('model-channel-subscriber-stub').exists()).toBe(true)
})
