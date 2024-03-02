import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload, buildApiKeyPayload, buildRunningSessionPayload, buildTrainedModelPayload } from 'test/unit/factories'

import { AccessCodeExample } from '@/components/ApiKey/types'
import ApiKeyManagement from '@/components/Models/ApiKeyManagement.vue'
import { installCommonComponents } from '@/plugins/components'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { RunningSessionPayload, TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VueJSModal)
installCommonComponents(localVue)

const $route = { params: { modelId: 123 } }
const mocks = { $route }

const v7Team = buildTeamPayload({ id: 1, name: 'V7' })

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

describe('when running session', () => {
  let runningSession: RunningSessionPayload
  let propsData: { model: RunningSessionPayload }

  let key1: ApiKeyPayload
  let key2: ApiKeyPayload
  let key3: ApiKeyPayload

  beforeEach(() => {
    runningSession = buildRunningSessionPayload({})
    propsData = { model: runningSession }

    key1 = buildApiKeyPayload({
      id: 1,
      prefix: 'abcd',
      name: 'Key 1',
      team_id: 1,
      permissions: [['run_inference', `running_session:${runningSession.id}`]]
    })

    key2 = buildApiKeyPayload({
      id: 2,
      prefix: 'efgh',
      name: 'Key 2',
      team_id: 1,
      permissions: [['run_inference', `running_session:${runningSession.id}`]]
    })

    key3 = buildApiKeyPayload({
      id: 3,
      prefix: 'ijkl',
      name: 'Key 3',
      team_id: 1,
      permissions: [['run_inference', 'running_session:other']]
    })

    store.commit('team/SET_CURRENT_TEAM', v7Team)
    store.commit('apiKey/SET_API_KEYS', [key1, key2, key3])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('dispatches store action on "add key"', async () => {
    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })

    await wrapper.find('key-dropdown-stub').vm.$emit('select', key3)
    expect(store.dispatch)
      .toHaveBeenCalledWith('apiKey/attachPermissionToModel', { apiKey: key3, runningSession })
  })

  it('dispatches toast if "add key" fails', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Test error' } })

    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })

    await wrapper.find('key-dropdown-stub').vm.$emit('select', key3)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Test error' })
  })

  describe('snippets', () => {
    let wrapper: Wrapper<Vue>

    beforeEach(() => {
      wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })
    })

    const getSnippets = (wrapper: Wrapper<Vue>) => {
      const component = wrapper.vm as any
      return component.snippets as AccessCodeExample[]
    }

    it('loads correct number', () => {
      const snippets = getSnippets(wrapper)
      expect(snippets.length).toEqual(5)
    })

    it('dynamically adds model id to snippets', () => {
      // we check that the `{modelId}` placeholder got replaced, if it's in the original
      const snippets = getSnippets(wrapper)
      snippets.forEach(({ language, code }) => {
        if (language !== 'cli') { expect(code).toContain(runningSession.id) }
        expect(code).not.toContain('{modelId}')
      })
    })

    it('updates when model changes', async () => {
      const runningSession2 = { ...runningSession, id: 'new-id' }
      await wrapper.setProps({ model: runningSession2 })

      // we check that the `{modelId}` placeholder got replaced, if it's in the original
      const snippets = getSnippets(wrapper)
      snippets.forEach(({ language, code }) => {
        if (language !== 'cli') {
          expect(code).toContain('new-id')
        }
        expect(code).not.toContain('{modelId}')
      })
    })
  })
})

describe('when trained model', () => {
  let trainedModel: TrainedModelPayload
  let propsData: { model: TrainedModelPayload }

  let key1: ApiKeyPayload
  let key2: ApiKeyPayload
  let key3: ApiKeyPayload

  beforeEach(() => {
    trainedModel = buildTrainedModelPayload({})
    propsData = { model: trainedModel }

    key1 = buildApiKeyPayload({
      id: 1,
      prefix: 'abcd',
      name: 'Key 1',
      team_id: 1,
      permissions: [['run_inference', `trained_model:${trainedModel.id}`]]
    })

    key2 = buildApiKeyPayload({
      id: 2,
      prefix: 'efgh',
      name: 'Key 2',
      team_id: 1,
      permissions: [['run_inference', `trained_model:${trainedModel.id}`]]
    })

    key3 = buildApiKeyPayload({
      id: 3,
      prefix: 'ijkl',
      name: 'Key 3',
      team_id: 1,
      permissions: [['run_inference', 'trained_model:other']]
    })

    store.commit('team/SET_CURRENT_TEAM', v7Team)
    store.commit('apiKey/SET_API_KEYS', [key1, key2, key3])
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('dispatches store action on "add key"', async () => {
    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })

    await wrapper.find('key-dropdown-stub').vm.$emit('select', key3)
    expect(store.dispatch)
      .toHaveBeenCalledWith('apiKey/attachPermissionToModel', { apiKey: key3, trainedModel })
  })

  it('dispatches toast if "add key" fails', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Test error' } })

    const wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })

    await wrapper.find('key-dropdown-stub').vm.$emit('select', key3)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Test error' })
  })

  describe('snippets', () => {
    let wrapper: Wrapper<Vue>

    beforeEach(() => {
      wrapper = shallowMount(ApiKeyManagement, { localVue, store, mocks, propsData })
    })

    const getSnippets = (wrapper: Wrapper<Vue>) => {
      const component = wrapper.vm as any
      return component.snippets as AccessCodeExample[]
    }

    it('loads correct number', () => {
      const snippets = getSnippets(wrapper)
      expect(snippets.length).toEqual(5)
    })

    it('dynamically adds model id to snippets', () => {
      // we check that the `{modelId}` placeholder got replaced, if it's in the original
      const snippets = getSnippets(wrapper)
      snippets.forEach(({ language, code }) => {
        if (language !== 'cli') { expect(code).toContain(trainedModel.id) }
        expect(code).not.toContain('{modelId}')
      })
    })

    it('updates when model changes', async () => {
      const trainedModel2 = { ...trainedModel, id: 'new-id' }
      await wrapper.setProps({ model: trainedModel2 })

      // we check that the `{modelId}` placeholder got replaced, if it's in the original
      const snippets = getSnippets(wrapper)
      snippets.forEach(({ language, code }) => {
        if (language !== 'cli') { expect(code).toContain('new-id') }
        expect(code).not.toContain('{modelId}')
      })
    })
  })
})
