import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { v4 as uuidv4 } from 'uuid'
import Vuex from 'vuex'

import {
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildCustomerSubscriptionPayload
} from 'test/unit/factories'

import { installCommonComponents } from '@/plugins/components'
import billing, { getInitialState as getInitialBillingState } from '@/store/modules/billing'
import dataset, { getInitialState as getInitialDatasetState } from '@/store/modules/dataset'
import datasetUpload, {
  getInitialState as getInitialDatasetUploadState
} from '@/store/modules/datasetUpload'
import toast, { getInitialState as getInitialToastState } from '@/store/modules/toast'
import ui, { getInitialState as getInitialUIState } from '@/store/modules/ui'
import { RootState } from '@/store/types'
import Create from '@/views/datasets/create/steps/Create.vue'

let info: ReturnType<typeof buildBillingInfoPayload>

const setupLocalVue = () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  installCommonComponents(localVue)
  return localVue
}

const newStore = () => {
  const store = new Vuex.Store<RootState>({
    modules: {
      datasetUpload: { ...datasetUpload, state: getInitialDatasetUploadState() },
      dataset: { ...dataset, state: getInitialDatasetState() },
      toast: { ...toast as any, state: getInitialToastState() },
      ui: { ...ui, state: getInitialUIState() },
      billing: {
        ...billing,
        state: getInitialBillingState()
      }
    }
  })

  info = buildBillingInfoPayload({
    customer: buildCustomerPayload({}),
    customer_subscription: buildCustomerSubscriptionPayload({
      annotation_credits_bonus: 10,
      annotation_credits_standard: 100,
      annotation_credits_standard_max_in_period: 100,
      annotation_credits_used: 111
    })
  })
  store.commit('billing/SET_BILLING_INFO', info)

  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const createFile = (name?: string) => new File([''], name || uuidv4(), { type: 'image/png' })

it('matches snapshot', () => {
  const localVue = setupLocalVue()
  const store = newStore()
  const mocks = {
    $featureEnabled: (): boolean => false
  }
  const wrapper = shallowMount(Create, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

describe('integration', () => {
  it('creates dataset using store', async () => {
    const localVue = setupLocalVue()
    const store = newStore()
    const mocks = {
      $ga: { event: jest.fn() },
      $featureEnabled: (): boolean => false,
      $router: { push: jest.fn() }
    }

    const wrapper = mount(Create, { localVue, store, mocks })

    const mockDispatch = jest.spyOn(store, 'dispatch').mockResolvedValue({ data: {} })

    wrapper.find('input[type=text]').setValue('My Dataset')
    wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    expect(mockDispatch).toHaveBeenCalledWith('dataset/createDataset', { name: 'My Dataset', isPublic: false })
  })

  it('validates name locally', async () => {
    const localVue = setupLocalVue()
    const store = newStore()
    const mocks = {
      $featureEnabled: (): boolean => false,
      $ga: {
        event: jest.fn()
      }
    }

    const wrapper = mount(Create, { localVue, store, mocks })
    wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('cannot be empty')
  })

  it('shows remote name validation error', async () => {
    const localVue = setupLocalVue()
    const store = newStore()
    const mocks = {
      $ga: { event: jest.fn() },
      $featureEnabled: (): boolean => false,
      $router: { push: jest.fn() }
    }

    const wrapper = mount(Create, { localVue, store, mocks })

    jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { name: 'validation error' } })

    wrapper.find('input[type=text]').setValue('My Dataset')
    wrapper.find('form').trigger('submit')

    await flushPromises()

    expect(wrapper.text()).toContain('validation error')
  })
})

describe('beforeRouteEnter', () => {
  it('prevents navigating to route if another upload is already in progress', async () => {
    const localVue = setupLocalVue()
    const store = newStore()
    store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
    store.commit('datasetUpload/ADD_FILES', [createFile()])

    const mocks = {
      $ga: { event: jest.fn() },
      $featureEnabled: (): boolean => false,
      $router: { push: jest.fn() }
    }

    jest.spyOn(store, 'dispatch').mockResolvedValue({})

    const wrapper = shallowMount(Create, { localVue, store, mocks })
    const component = (wrapper.vm as any)

    const mockNext =
      jest.fn()
        .mockImplementationOnce((callback) => callback(component))

    component.beforeRouteEnter(null, null, mockNext)
    await wrapper.vm.$nextTick()

    expect(mockNext).toHaveBeenCalledWith('/datasets')
  })

  it('resets finished upload if there is one', async () => {
    const localVue = setupLocalVue()
    const store = newStore()
    store.commit('datasetUpload/SET_UPLOAD_STATUS', 'started')
    const mocks = {
      $ga: { event: jest.fn() },
      $featureEnabled: (): boolean => false,
      $router: { push: jest.fn() }
    }

    const commitSpy = jest.spyOn(store, 'commit')

    const wrapper = shallowMount(Create, { localVue, store, mocks })
    const component = (wrapper.vm as any)

    const mockNext =
      jest.fn()
        .mockImplementationOnce((callback) => callback(component))

    component.beforeRouteEnter(null, null, mockNext)
    await wrapper.vm.$nextTick()
    expect(commitSpy).toHaveBeenCalledWith('datasetUpload/STOP_UPLOAD')
  })
})

describe('validateForm', () => {
  it('validates presence of name', async () => {
    const mocks = {
      $featureEnabled: (): boolean => false
    }
    const localVue = setupLocalVue()
    const store = newStore()
    const wrapper = shallowMount(Create, { localVue, store, mocks })
    const component = wrapper.vm as any

    expect(component.validateForm()).toEqual({ name: 'Dataset Title cannot be empty!' })
    wrapper.setData({ name: 'Foo' })
    await wrapper.vm.$nextTick()
    expect(component.validateForm()).toEqual({})
  })
})

describe('createDataset', () => {
  const mountWithMocks = () => {
    const localVue = setupLocalVue()
    const store = newStore()
    const mocks = {
      $ga: { event: jest.fn() },
      $featureEnabled: (): boolean => false,
      $router: { push: jest.fn() }
    }
    return mount(Create, { localVue, store, mocks })
  }
  it('validates form locally', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    jest.spyOn(component, 'validateForm').mockReturnValue({ name: 'error' })

    component.createDataset()
    await wrapper.vm.$nextTick()
    expect(component.validateForm).toHaveBeenCalled()
  })

  it('tracks ga event on local validation failure', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    jest.spyOn(component, 'validateForm').mockReturnValue({ name: 'error' })

    component.createDataset()

    await flushPromises()

    expect(component.$ga.event).toHaveBeenCalledWith('create_dataset', 'continue_step_1', 'failure_form_invalid')
  })

  it('calls store action to create dataset', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    wrapper.setData({ name: 'My Dataset' })
    jest.spyOn(component.$store, 'dispatch').mockResolvedValue({ data: {} })

    component.createDataset()
    await wrapper.vm.$nextTick()
    expect(component.$store.dispatch).toHaveBeenCalledWith('dataset/createDataset', { name: 'My Dataset', isPublic: false })
  })

  it('tracks ga event on creation success', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    wrapper.setData({ name: 'My Dataset' })
    jest.spyOn(component.$store, 'dispatch').mockResolvedValue({ data: {} })

    component.createDataset()
    await flushPromises()
    expect(component.$ga.event).toHaveBeenCalledWith('create_dataset', 'continue_step_1', 'success')
  })

  it('renders remote validation errors', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    wrapper.setData({ name: 'My Dataset' })
    jest.spyOn(component.$store, 'dispatch').mockResolvedValue({ error: { name: 'remote error' } })

    component.createDataset()
    await flushPromises()
    expect(wrapper.text()).toContain('remote error')
  })

  it('tracks ga event on remote creation failure', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    wrapper.setData({ name: 'My Dataset' })
    jest.spyOn(component.$store, 'dispatch').mockResolvedValue({ error: { name: 'remote error' } })

    component.createDataset()
    await flushPromises()
    expect(component.$ga.event).toHaveBeenCalledWith('create_dataset', 'continue_step_1', 'failure_backend_error')
  })

  it('navigates to next step on success', async () => {
    const wrapper = mountWithMocks()
    const component = wrapper.vm as any

    wrapper.setData({ name: 'My Dataset' })
    jest.spyOn(component.$store, 'dispatch').mockResolvedValue({ data: { id: 1 } })

    component.createDataset()
    await flushPromises()
    expect(component.$router.push).toHaveBeenCalledWith({ name: 'DatasetCreationDataStep', params: { datasetId: 1 } })
  })
})
