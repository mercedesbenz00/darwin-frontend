import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import { advanceTo, clear } from 'jest-date-mock'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildModelTemplatePayload,
  buildRunningSessionPayload,
  buildTeamPayload,
  buildTrainedModelPayload,
  buildTrainingSessionPayload
} from 'test/unit/factories'
import { VPopover } from 'test/unit/stubs'

import ModelListItem from '@/components/Models/ModelManagement/ModelListItem.vue'
import { ModelItem } from '@/components/Models/types'
import { ModelType } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = { VPopover, 'router-link': true }

const aFewSecondsAgo = '2020-05-05T01:02:00Z'
const now = '2020-05-05T01:02:03Z'

const dataset = buildDatasetPayload({ name: 'Smart Fume Hood', id: 5, slug: 'sfh' })
const modelTemplate = buildModelTemplatePayload({ type: ModelType.InstanceSegmentation })
const team = buildTeamPayload({ id: 123 })
const trainedModel = buildTrainedModelPayload({ model_template: modelTemplate })

let store: ReturnType<typeof createTestStore>
let propsData: { model: ModelItem }

beforeEach(() => {
  store = createTestStore()
  store.commit('dataset/SET_DATASETS', [dataset])
  store.commit('team/SET_CURRENT_TEAM', team)
  advanceTo(now)
})

afterEach(() => clear())

describe('for training session', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    const model: ModelItem = {
      datasetSlug: null,
      id: 'training-session',
      insertedAt: aFewSecondsAgo,
      name: 'A session',
      teamId: 1,
      trainingSession: buildTrainingSessionPayload({
        id: 'training-session',
        model_template: modelTemplate,
        inserted_at: aFewSecondsAgo
      })

    }
    propsData = { model }
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('renders training button', () => {
    expect(wrapper.find('training-button-stub').exists()).toBe(true)
  })

  it('dispatches a stopTrainingSession action upon click', async () => {
    await wrapper.find('.model-listitem__more__popover__list__item').trigger('click')
    expect(store.dispatch).toBeCalledWith('neuralModel/stopTrainingSession', propsData.model)
  })
})

describe('for trained model', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    const model: ModelItem = {
      datasetSlug: null,
      id: 'trained-model',
      insertedAt: aFewSecondsAgo,
      name: 'A trained model',
      teamId: 1,
      trainedModel: buildTrainedModelPayload({
        id: 'trained-model',
        model_template: modelTemplate,
        name: 'A trained model',
        inserted_at: aFewSecondsAgo
      })

    }
    propsData = { model }
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('renders deploy button', () => {
    expect(wrapper.find('deploy-button-stub').exists()).toBe(true)
  })
})

describe('for private running session', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    const model: ModelItem = {
      datasetSlug: null,
      id: 'running-session',
      insertedAt: aFewSecondsAgo,
      name: 'A running session',
      teamId: 1,
      runningSession: buildRunningSessionPayload({
        id: 'running-session',
        name: 'A running session',
        inserted_at: aFewSecondsAgo,
        trained_model_id: trainedModel.id
      })

    }
    propsData = { model }
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when associated trained model in store', () => {
    store.commit('neuralModel/SET_TRAINED_MODELS', [trainedModel])
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders update button', () => {
    expect(wrapper.find('update-button-stub').exists()).toBe(true)
  })
})

describe('for public running session', () => {
  let wrapper: Wrapper<Vue>

  beforeEach(() => {
    const model: ModelItem = {
      datasetSlug: null,
      id: 'running-session',
      insertedAt: aFewSecondsAgo,
      name: 'A running session',
      teamId: 1,
      runningSession: buildRunningSessionPayload({
        access_level: 'public',
        id: 'running-session',
        name: 'A running session',
        inserted_at: aFewSecondsAgo,
        team_id: 1,
        trained_model_id: trainedModel.id
      })

    }
    propsData = { model }
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
  })

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when associated trained model in store', () => {
    store.commit('neuralModel/SET_TRAINED_MODELS', [trainedModel])
    wrapper = shallowMount(ModelListItem, { localVue, propsData, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders public running session button', () => {
    expect(wrapper.find('public-running-session-button-stub').exists()).toBe(true)
  })
})
