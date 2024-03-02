import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload, buildTeamPayload, buildTrainedModelPayload } from 'test/unit/factories'

import CreateKey from '@/components/Models/ApiKeyManagement/CreateKey.vue'
import { installCommonComponents } from '@/plugins/components'
import { RunningSessionPayload, TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
})

describe('when running session', () => {
  let runningSession: RunningSessionPayload
  let propsData: { model: RunningSessionPayload }

  beforeEach(() => {
    runningSession = buildRunningSessionPayload()
    propsData = { model: runningSession }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('validates key name', async () => {
    const setError = jest.fn()

    const InputFieldStub = localVue.extend({
      name: 'input-field-stub',
      template: '<div />',
      methods: { setError }
    })

    const stubs = { InputField: InputFieldStub }

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })

    await wrapper.find('positive-button-stub').vm.$emit('click')

    expect(store.dispatch).not.toHaveBeenCalled()
    expect(setError).toHaveBeenCalledWith('You must type in a name.')
  })

  it('dispatches action to create key', async () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('apiKey/createForModel', {
      name: 'test key',
      runningSession,
      teamId: 7
    })
  })

  it('dispatches action to create key on input enter', () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    wrapper.find('input-field-stub').vm.$emit('enter')

    expect(store.dispatch).toHaveBeenCalledWith('apiKey/createForModel', {
      name: 'test key',
      runningSession,
      teamId: 7
    })
  })

  it('shows toast on create failure', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'test error' } })

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'test error' })
  })

  it('sets key on creation', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ data: { prefix: 'foo', value: 'bar' } })

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    await flushPromises()

    expect(wrapper.html()).toContain('foo.bar')
  })

  it('matches snapshot when key created', () => {
    const data = () => { return { key: 'fake-created-key.random' } }
    const wrapper = shallowMount(CreateKey, { data, localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})

describe('when trained model', () => {
  let trainedModel: TrainedModelPayload
  let propsData: { model: TrainedModelPayload }

  beforeEach(() => {
    trainedModel = buildTrainedModelPayload()
    propsData = { model: trainedModel }
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('validates key name', async () => {
    const setError = jest.fn()

    const InputFieldStub = localVue.extend({
      name: 'input-field-stub',
      template: '<div />',
      methods: { setError }
    })

    const stubs = { InputField: InputFieldStub }

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })
    await wrapper.find('positive-button-stub').vm.$emit('click')
    expect(store.dispatch).not.toHaveBeenCalled()
    expect(setError).toHaveBeenCalledWith('You must type in a name.')
  })

  it('dispatches action to create key', async () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('apiKey/createForModel', {
      name: 'test key',
      teamId: 7,
      trainedModel
    })
  })

  it('dispatches action to create key on input enter', () => {
    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    wrapper.find('input-field-stub').vm.$emit('enter')

    expect(store.dispatch).toHaveBeenCalledWith('apiKey/createForModel', {
      name: 'test key',
      teamId: 7,
      trainedModel
    })
  })

  it('shows toast on create failure', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'test error' } })

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'test error' })
  })

  it('sets key on creation', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ data: { prefix: 'foo', value: 'bar' } })

    const wrapper = shallowMount(CreateKey, { localVue, propsData, store })

    wrapper.find('input-field-stub').vm.$emit('change', 'test key')
    await wrapper.find('positive-button-stub').vm.$emit('click')

    await flushPromises()

    expect(wrapper.html()).toContain('foo.bar')
  })

  it('matches snapshot when key created', () => {
    const data = () => { return { key: 'fake-created-key.random' } }
    const wrapper = shallowMount(CreateKey, { data, localVue, propsData, store })
    expect(wrapper).toMatchSnapshot()
  })
})
