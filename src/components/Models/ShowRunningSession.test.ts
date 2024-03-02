import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildRunningSessionPayload,
  buildTeamPayload,
  buildTrainedModelPayload,
  buildTrainingSessionPayload
} from 'test/unit/factories'

import ShowRunningSession from '@/components/Models/ShowRunningSession.vue'
import { RunningSessionPayload, TrainingSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})

const team = buildTeamPayload({ id: 123 })

let store: ReturnType<typeof createTestStore>
let propsData: {
  runningSession: RunningSessionPayload
} | {
  runningSession: RunningSessionPayload,
  trainingSession: TrainingSessionPayload
}

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', team)
  propsData = {
    runningSession: buildRunningSessionPayload({
      id: '123',
      name: 'Object Detection Model',
      team_id: team.id,
      trained_model_id: '456'
    })
  }
})

describe('running session in the process of starting', () => {
  beforeEach(() => {
    propsData.runningSession = buildRunningSessionPayload({
      id: '123',
      team_id: team.id,
      trained_model_id: '456',
      meta: {
        classes: [],
        num_instances_available: 0,
        num_instances_starting: 1
      }
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('matches snapshot when trained model exists in the store', () => {
    const trainedModel = buildTrainedModelPayload({ id: '456' })
    store.commit('neuralModel/SET_TRAINED_MODELS', [trainedModel])
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('does not render inference', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper.find('model-inference-stub').exists()).toBe(false)
  })

  it('renders update button', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper.find('update-button-stub').exists()).toBe(true)
  })
})

describe('fully started running session', () => {
  beforeEach(() => {
    propsData.runningSession = buildRunningSessionPayload({
      id: '123',
      team_id: team.id,
      trained_model_id: '456',
      meta: {
        classes: [],
        num_instances_available: 1,
        num_instances_starting: 0
      }
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders inference', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper.find('model-inference-stub').exists()).toBe(true)
  })

  it('renders update button', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper.find('update-button-stub').exists()).toBe(true)
  })
})

describe('public running session', () => {
  beforeEach(() => {
    propsData.runningSession = buildRunningSessionPayload({
      access_level: 'public',
      id: '123',
      team_id: -1,
      trained_model_id: '456',
      meta: {
        classes: [],
        num_instances_available: 1,
        num_instances_starting: 0
      }
    })
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders public running session button', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper.find('public-running-session-button-stub').exists()).toBe(true)
  })
})

describe('with training session', () => {
  beforeEach(() => {
    propsData = {
      ...propsData,
      trainingSession: buildTrainingSessionPayload({
        id: '123',
        team_id: team.id,
        trained_model_id: propsData.runningSession.trained_model_id
      })
    }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowRunningSession, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
