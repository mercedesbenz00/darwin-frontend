import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload, buildTrainedModelPayload } from 'test/unit/factories'

import ShowView from '@/views/models/ShowView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
const stubs = ['router-link', 'router-view']

let store: ReturnType<typeof createTestStore>
let mocks: {
  $route: { params: { modelId: string } },
  $router: { push: jest.Mock }
}

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $route: { params: { modelId: '123' } },
    $router: { push: jest.fn() }
  }
})

describe('on matched trained model', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_TRAINED_MODELS', [buildTrainedModelPayload({ id: '123' })])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders trained model UI', () => {
    const wrapper = shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(wrapper.find('show-trained-model-stub').exists()).toBe(true)
  })
})

describe('on matched running session', () => {
  beforeEach(() => {
    store.commit('neuralModel/SET_RUNNING_SESSIONS', [buildRunningSessionPayload({ id: '123' })])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders running session UI', () => {
    const wrapper = shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(wrapper.find('show-running-session-stub').exists()).toBe(true)
  })
})

describe('un unmatched record', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(wrapper).toMatchSnapshot()
  })

  it('redirects to index', () => {
    shallowMount(ShowView, { localVue, mocks, store, stubs })
    expect(mocks.$router.push).toHaveBeenCalledWith({ name: 'ModelsIndex' })
  })
})
