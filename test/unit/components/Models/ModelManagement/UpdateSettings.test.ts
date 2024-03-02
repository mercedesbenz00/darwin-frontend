import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildRunningSessionPayload } from 'test/unit/factories'

import UpdateSettings from '@/components/Models/ModelManagement/UpdateSettings.vue'
import clickOutsideDirective from '@/directives/click-outside'
import { installCommonComponents } from '@/plugins/components'
import { RunningSessionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('click-outside', clickOutsideDirective)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
let runningSession: RunningSessionPayload

beforeEach(() => {
  store = createTestStore()
})

const model = {
  instanceCount: 'instance-count-stub',
  saveButton: 'primary-button-stub'
}

const itMatchesSnapshot = () => {
  it('matches snapshot', () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })
    expect(wrapper).toMatchSnapshot()
  })
}

const itHasSameBehaviorInDeployedAndStopped = () => {
  it('can cancel out', async () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })
    await wrapper.find('.update-settings__footer secondary-button-stub').vm.$emit('click')
    expect(store.state.neuralModel.selectedRunningSession).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })

  it('can cancel out of deploy by clicking outside', async () => {
    const parent = document.createElement('div')
    const clickEvent = new MouseEvent('click', { relatedTarget: parent })

    const wrapper = shallowMount(UpdateSettings, { attachTo: parent, localVue, store })

    document.dispatchEvent(clickEvent)
    await wrapper.vm.$nextTick()

    expect(store.state.neuralModel.selectedRunningSession).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })

  it('dispatches update action to store', async () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })

    await wrapper.find(model.instanceCount).vm.$emit('update:auto-start', true)
    await wrapper.find(model.instanceCount).vm.$emit('update:auto-stop', true)
    await wrapper.find(model.instanceCount).vm.$emit('update:minimum', 5)
    await wrapper.find(model.instanceCount).vm.$emit('update:maximum', 10)
    await wrapper.find(model.saveButton).vm.$emit('click')

    expect(store.dispatch).toHaveBeenCalledWith('neuralModel/updateModel', {
      autoStart: true,
      autoStop: true,
      maximumInstances: 10,
      minimumInstances: 5,
      runningSession
    })
  })

  it('closes on deploy success', async () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })

    await wrapper.find(model.instanceCount).vm.$emit('update:minimum', 5)
    await wrapper.find(model.instanceCount).vm.$emit('update:maximum', 10)
    await wrapper.find(model.saveButton).vm.$emit('click')

    await flushPromises()

    expect(store.state.neuralModel.selectedRunningSession).toEqual(null)
    expect(wrapper.html()).toEqual('')
  })

  it('dispatches toast error on deploy error', async () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })

    const dispatch = store.dispatch as jest.Mock
    dispatch.mockResolvedValue({ error: { message: 'Fake error' } })

    await wrapper.find(model.saveButton).vm.$emit('click')

    await flushPromises()

    expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
  })
}

describe('when deploying', () => {
  beforeEach(() => {
    runningSession = buildRunningSessionPayload({
      id: 'tr-123',
      name: 'Object Detection Model',
      min: 3,
      max: 5
    })
    store.commit('neuralModel/SELECT_RUNNING_SESSION', runningSession)
  })

  itMatchesSnapshot()
  itHasSameBehaviorInDeployedAndStopped()

  it('sets min/max from running session', () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })
    expect(wrapper.vm.$data.minimum).toEqual(3)
    expect(wrapper.vm.$data.maximum).toEqual(5)
  })
})

describe('when stopped', () => {
  beforeEach(() => {
    runningSession = buildRunningSessionPayload({
      id: 'tr-123',
      name: 'Object Detection Model',
      min: 0,
      max: 0
    })
    store.commit('neuralModel/SELECT_RUNNING_SESSION', runningSession)
  })

  itMatchesSnapshot()
  itHasSameBehaviorInDeployedAndStopped()

  it('defaults min/max to 1', () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })
    expect(wrapper.vm.$data.minimum).toEqual(1)
    expect(wrapper.vm.$data.maximum).toEqual(1)
  })
})

describe('when no running session selected', () => {
  itMatchesSnapshot()

  it('renders nothing', () => {
    const wrapper = shallowMount(UpdateSettings, { localVue, store })
    expect(wrapper.html()).toEqual('')
  })
})
