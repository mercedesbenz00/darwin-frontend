import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import {
  buildApiKeyPayload,
  buildRunningSessionPayload,
  buildTrainedModelPayload
} from 'test/unit/factories'
import { buttonEvents } from 'test/unit/testHelpers'

import RevokeKeyButton from '@/components/Models/ApiKeyManagement/RevokeKeyButton.vue'
import { installCommonComponents } from '@/plugins/components'
import { ApiKeyPayload } from '@/store/modules/apiKey/types'
import { RunningSessionPayload, TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

let key: ApiKeyPayload
let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

describe('when running session', () => {
  let runningSession: RunningSessionPayload
  let propsData: {
    apiKey: ApiKeyPayload
    model: RunningSessionPayload
  }

  beforeEach(() => {
    runningSession = buildRunningSessionPayload({})

    key = buildApiKeyPayload({
      id: 1,
      prefix: 'abcd',
      name: 'Key 1',
      team_id: 1,
      permissions: [['run_inference', `running_session:${runningSession.id}`]]
    })

    propsData = {
      apiKey: key,
      model: runningSession
    }
  })

  const mocks = { $modal: { show: jest.fn(), hide: jest.fn() } }

  it('matches snapshot', () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('shows and hides modal on revoke-cancel', async () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, mocks, store, propsData })

    await wrapper.find('negative-button-stub').vm.$emit('click', buttonEvents)
    expect(mocks.$modal.show).toHaveBeenCalled()

    await wrapper.find('secondary-button-stub.modal__footer-left').vm.$emit('click', buttonEvents)
    expect(mocks.$modal.hide).toHaveBeenCalled()
  })

  it('dispatches store action on confirmed revoke', async () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })

    await wrapper.find('positive-button-stub.modal__footer-right').vm.$emit('click', buttonEvents)
    expect(store.dispatch)
      .toHaveBeenCalledWith('apiKey/detachPermissionFromModel', { apiKey: key, runningSession })
  })

  it('dispatches toast if revoke fails', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Test error' } })

    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })

    await wrapper.find('positive-button-stub.modal__footer-right').vm.$emit('click', buttonEvents)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Test error' })
  })
})

describe('when trained model', () => {
  let trainedModel: TrainedModelPayload
  let propsData: {
    apiKey: ApiKeyPayload
    model: TrainedModelPayload
  }

  beforeEach(() => {
    trainedModel = buildTrainedModelPayload({})

    key = buildApiKeyPayload({
      id: 1,
      prefix: 'abcd',
      name: 'Key 1',
      team_id: 1,
      permissions: [['run_inference', `trained_mdoel:${trainedModel.id}`]]
    })

    propsData = {
      apiKey: key,
      model: trainedModel
    }
  })

  const mocks = { $modal: { show: jest.fn(), hide: jest.fn() } }

  it('matches snapshot', () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })
    expect(wrapper).toMatchSnapshot()
  })

  it('shows and hides modal on revoke-cancel', async () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, mocks, store, propsData })

    await wrapper.find('negative-button-stub').vm.$emit('click', buttonEvents)
    expect(mocks.$modal.show).toHaveBeenCalled()

    await wrapper.find('secondary-button-stub.modal__footer-left').vm.$emit('click', buttonEvents)
    expect(mocks.$modal.hide).toHaveBeenCalled()
  })

  it('dispatches store action on confirmed revoke', async () => {
    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })

    await wrapper.find('positive-button-stub.modal__footer-right').vm.$emit('click', buttonEvents)
    expect(store.dispatch)
      .toHaveBeenCalledWith('apiKey/detachPermissionFromModel', { apiKey: key, trainedModel })
  })

  it('dispatches toast if revoke fails', async () => {
    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Test error' } })

    const wrapper = shallowMount(RevokeKeyButton, { localVue, store, propsData })

    await wrapper.find('positive-button-stub.modal__footer-right').vm.$emit('click', buttonEvents)
    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Test error' })
  })
})
