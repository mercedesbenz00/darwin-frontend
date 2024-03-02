import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildDatasetPayload,
  buildTeamPayload
} from 'test/unit/factories'
import { DatasetDetailLayout } from 'test/unit/stubs'

import { installCommonComponents } from '@/plugins/components'
import { DatasetPayload } from '@/store/types'
import DatasetSettingsV2 from '@/views/datasets/detail/Settings/V2/DatasetSettings.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', () => {})
installCommonComponents(localVue)

const v7 = buildTeamPayload({ id: 1, name: 'V7', slug: 'v7' })
const sfh = buildDatasetPayload({ id: 1, slug: 'sfh', name: 'SFH', team_id: v7.id })

// Several components use dynamic imports, which shallowMount does not detect as
// a child component and thus, does not stub. We need to stub them manually.
const stubs: Stubs = {
  DatasetDetailLayout
}
let store: ReturnType<typeof createTestStore>

let mocks: {
  $can: () => boolean
  $ga: { event: jest.Mock }
  $modal: { show: jest.Mock, hide: jest.Mock }
  $router: { push: jest.Mock, replace: jest.Mock }
  $route: {}
  $theme: ReturnType<typeof createMockTheme>
}

let propsData: {
  dataset: DatasetPayload
}

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $can: (): boolean => true,
    $ga: { event: jest.fn() },
    $modal: {
      show: jest.fn(),
      hide: jest.fn()
    },
    $router: {
      push: jest.fn(),
      replace: jest.fn()
    },
    $route: {},
    $theme: createMockTheme()
  }

  store.commit('team/SET_CURRENT_TEAM', v7)

  propsData = {
    dataset: sfh
  }
})

it('matches snapshot when authorized to update', () => {
  const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('redirects when not authorized to update', () => {
  mocks.$can = (): boolean => false
  shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
  expect(mocks.$router.replace).toHaveBeenCalled()
})

const model = {
  annotatorsCanCreateTagsCheckBox: 'check-box-stub#annotatorTags',
  annotatorsCanInstantiateCheckBox: 'check-box-stub#annotatorWorkflows',
  confirmDialog: 'settings-save-confirm-dialog-stub',
  doubleAssignmentCheckBox: 'check-box-stub#doubleAssignment',
  froala: 'froala-stub',
  pdfFitPageCheckbox: 'check-box-stub#pdfFitPage',
  saveButton: '.dataset-settings__save',
  workforceManagers: 'workforce-managers-stub',
  workPriority: 'workflow-work-priority-stub',
  workSize: 'workflow-work-size-stub'
}

it('validates client side', async () => {
  const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
  await flushPromises()
  const component = wrapper.vm as any

  component.$refs.workSize.setError = jest.fn()

  await wrapper.find(model.workSize).vm.$emit('input', 'a')
  await wrapper.find(model.saveButton).vm.$emit('click')

  expect(store.dispatch).not.toHaveBeenCalledWith('dataset/updateDataset', expect.anything())
  expect(component.$refs.workSize.setError).toHaveBeenCalledWith(expect.any(String))
})

it('correctly saves to store', async () => {
  const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
  await flushPromises()

  await wrapper.find(model.froala).vm.$emit('input', 'New instructions')
  await wrapper.find(model.workSize).vm.$emit('input', 20)
  await wrapper.find(model.workPriority).vm.$emit('input', 'priority:asc')
  await wrapper.find(model.annotatorsCanCreateTagsCheckBox).vm.$emit('input', true)
  await wrapper.find(model.pdfFitPageCheckbox).vm.$emit('input', false)
  await wrapper.find(model.doubleAssignmentCheckBox).vm.$emit('input', true)

  await wrapper.find(model.saveButton).vm.$emit('click')
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('dataset/updateDataset', {
    dataset: sfh,
    params: {
      name: 'SFH',
      workSize: 20,
      workPrioritization: 'priority:asc',
      instructions: 'New instructions',
      anyoneCanDoubleAssign: true,
      annotatorsCanCreateTags: true,
      annotatorsCanInstantiateWorkflows: false,
      pdfFitPage: false
    }
  })
  expect(mocks.$router.push).not.toBeCalled()
})

it('correctly saves workforce managers to store, with correct disabled state', async () => {
  const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })

  expect(wrapper.find(model.saveButton).attributes('disabled')).toBe('true')

  const payload = [
    { invitationId: undefined, managerId: undefined, userId: 111 },
    { invitationId: 1, managerId: undefined, userId: undefined },
    { invitationId: undefined, managerId: 3, userId: 222 }
  ]
  await wrapper.find(model.workforceManagers).vm.$emit('change', payload)

  expect(wrapper.find(model.saveButton).attributes('disabled')).toBeUndefined()

  await wrapper.find(model.saveButton).vm.$emit('click')
  await flushPromises() // wait on saving workflow templates

  expect(store.dispatch).toHaveBeenCalledWith('dataset/updateDataset', {
    dataset: sfh,
    params: expect.objectContaining({ workforceManagers: payload })
  })

  await flushPromises()

  expect(wrapper.find('secondary-button-stub.dataset-settings__save').attributes('disabled'))
    .toBe('true')

  expect(mocks.$router.push).not.toBeCalled()
})

it('omits confirmation dialog if moving to another route when not dirty', async () => {
  const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
  await flushPromises()

  const nextFn = jest.fn()
  const component = wrapper.vm as any
  component.beforeRouteLeave({}, {}, nextFn)
  await wrapper.vm.$nextTick()

  expect(mocks.$modal.show).not.toBeCalledWith('settings-save-confirm')
})

describe('shows confirmation dialog if you are trying to move to another route when dirty', () => {
  it('when discard clicked, never submits to the backend and moves the next route', async () => {
    const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
    await flushPromises()

    wrapper.vm.$data.workSize = 50

    const nextFn = jest.fn()
    const component = wrapper.vm as any
    component.beforeRouteLeave({ path: '/others' }, {}, nextFn)
    await wrapper.vm.$nextTick()

    expect(mocks.$modal.show).toBeCalledWith('settings-save-confirm')
    await wrapper.find(model.confirmDialog).vm.$emit('discard')
    expect(mocks.$modal.hide).toBeCalledWith('settings-save-confirm')
    expect(mocks.$router.push).toBeCalledWith({ path: '/others' })
    expect(store.dispatch).not.toBeCalledWith('dataset/updateDataset', expect.any(Object))
  })

  it('when save clicked, submits to the backend and moves to the next route', async () => {
    const wrapper = shallowMount(DatasetSettingsV2, { localVue, mocks, propsData, store, stubs })
    await flushPromises()

    wrapper.vm.$data.workSize = 50

    const nextFn = jest.fn()
    const component = wrapper.vm as any
    component.beforeRouteLeave({ path: '/others' }, {}, nextFn)
    await wrapper.vm.$nextTick()

    expect(mocks.$modal.show).toBeCalledWith('settings-save-confirm')
    await wrapper.find(model.confirmDialog).vm.$emit('save')
    expect(store.dispatch).toBeCalledWith('dataset/updateDataset', expect.any(Object))
    await flushPromises()
    expect(mocks.$modal.hide).toBeCalledWith('settings-save-confirm')
    expect(mocks.$router.push).toBeCalledWith({ path: '/others' })
  })
})
