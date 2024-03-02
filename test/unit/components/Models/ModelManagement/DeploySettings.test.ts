import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTrainedModelPayload } from 'test/unit/factories'

import DeploySettings from '@/components/Models/ModelManagement/DeploySettings.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { installCommonComponents } from '@/plugins/components'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { TrainedModelPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

const model = {
  instanceCount: 'instance-count-stub',
  saveButton: 'primary-button-stub'
}

describe('when deploying', () => {
  let trainedModel: TrainedModelPayload

  beforeEach(() => {
    trainedModel = buildTrainedModelPayload({ id: 'tr-123', name: 'Object Detection Model' })
    store.commit('neuralModel/SELECT_TRAINED_MODEL', trainedModel)
  })

  it('matches snapshot', () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('can cancel out of deploy', async () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })
    await wrapper.find('.deploy-settings__footer secondary-button-stub').vm.$emit('click')
    expect(store.state.neuralModel.selectedTrainedModel).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })

  it('can cancel out of deploy by clicking outside', async () => {
    const parent = document.createElement('div')
    const clickEvent = new MouseEvent('click', { relatedTarget: parent })

    const wrapper = shallowMount(DeploySettings, { attachTo: parent, localVue, store })

    document.dispatchEvent(clickEvent)
    await wrapper.vm.$nextTick()

    expect(store.state.neuralModel.selectedTrainedModel).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })
  it('sets name from trained model', () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })
    expect(wrapper.vm.$data.name).toEqual(trainedModel.name)
  })

  it('dispatches deploy action to store', async () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })

    await wrapper.find(model.instanceCount).vm.$emit('update:auto-start', true)
    await wrapper.find(model.instanceCount).vm.$emit('update:auto-stop', true)
    await wrapper.find(model.instanceCount).vm.$emit('update:minimum', 5)
    await wrapper.find(model.instanceCount).vm.$emit('update:maximum', 10)
    await wrapper.find(model.saveButton).vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('neuralModel/deployModel', {
      autoStart: true,
      autoStop: true,
      device: ModelDevice.GPU,
      isPublic: false,
      maximumInstances: 10,
      minimumInstances: 5,
      name: 'Object Detection Model',
      trainedModel
    })
  })

  it('closes on deploy success', async () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })

    await wrapper.find(model.instanceCount).vm.$emit('update:minimum', 5)
    await wrapper.find(model.instanceCount).vm.$emit('update:maximum', 10)
    await wrapper.find(model.saveButton).vm.$emit('click')
    await flushPromises()

    expect(store.state.neuralModel.selectedTrainedModel).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })

  it('dispatches toast error on deploy error', async () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Fake error' } })

    await wrapper.find(model.saveButton).vm.$emit('click')

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
})

describe('when not deploying', () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })

  it('renders nothing', () => {
    const wrapper = shallowMount(DeploySettings, { localVue, store })
    expect(wrapper.html()).toEqual('')
  })
})
