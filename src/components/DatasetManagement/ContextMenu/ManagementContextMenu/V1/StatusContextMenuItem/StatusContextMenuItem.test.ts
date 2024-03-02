import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { VPopover } from 'test/unit/stubs'

import ConfirmationDialogLayout from '@/components/Common/ConfirmationDialogLayout.vue'
import StatusContextMenuItem from '@/components/DatasetManagement/ContextMenu/ManagementContextMenu/V1/StatusContextMenuItem/StatusContextMenuItem.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)
localVue.use(VModal)
installCommonComponents(localVue)

const stubs = { ConfirmationDialogLayout, VPopover }
let store: ReturnType<typeof createTestStore>

let mocks: {
  $modal: { show: jest.Mock, hide: jest.Mock }
}

beforeEach(() => {
  store = createTestStore()
  mocks = {
    $modal: { show: jest.fn(), hide: jest.fn() }
  }
})

const model = {
  confirmModal: 'delete-confirmation-dialog-stub',
  markAsCompleteButton: '.status-selection__item:nth-child(1)',
  advanceToNextStageButton: '.status-selection__item:nth-child(2)',
  moveToNewButton: '.status-selection__item:nth-child(3)',
  resetToNewButton: '.status-selection__item:nth-child(4)'
}

it('matches snapshot', () => {
  const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

describe('on mark as complete', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.markAsCompleteButton).trigger('click')

    expect(store.dispatch).toHaveBeenCalledWith('dataset/markSelectedItemsCompleted')
  })

  it('disables button while action is in progress', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    const button = wrapper.find(model.markAsCompleteButton)

    expect(button.attributes('disabled')).toBeFalsy()
    await button.trigger('click')
    expect(button.attributes('disabled')).toBeTruthy()
    await flushPromises()
    expect(button.attributes('disabled')).toBeFalsy()
  })
})

describe('on advance to next stage', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.advanceToNextStageButton).trigger('click')

    expect(store.dispatch).toHaveBeenCalledWith('dataset/advanceSelectedItemsToNextStage')
  })

  it('disables button while action is in progress', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    const button = wrapper.find(model.advanceToNextStageButton)

    expect(button.attributes('disabled')).toBeFalsy()
    await button.trigger('click')
    expect(button.attributes('disabled')).toBeTruthy()
    await flushPromises()
    expect(button.attributes('disabled')).toBeFalsy()
  })
})

describe('on move to new', () => {
  it('dispatches action', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.moveToNewButton).trigger('click')

    expect(store.dispatch).toHaveBeenCalledWith('dataset/moveSelectedItemsToNew')
  })

  it('dispatches toast on success', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.moveToNewButton).trigger('click')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', expect.anything())
  })

  it('disables button while action is in progress', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    const button = wrapper.find(model.moveToNewButton)

    expect(button.attributes('disabled')).toBeFalsy()
    await button.trigger('click')
    expect(button.attributes('disabled')).toBeTruthy()
    await flushPromises()
    expect(button.attributes('disabled')).toBeFalsy()
  })
})

describe('on reset workflow to new', () => {
  it('asks for confirmation', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, mocks, store, stubs })

    await wrapper.find(model.resetToNewButton).trigger('click')
    expect(mocks.$modal.show).toHaveBeenCalled()
  })

  it('dispatches action', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.confirmModal).vm.$emit('confirmed')

    expect(store.dispatch).toHaveBeenCalledWith('dataset/resetSelectedItemsToNew')
  })

  it('dispatches toast on success', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    await wrapper.find(model.confirmModal).vm.$emit('confirmed')
    await flushPromises()
    expect(store.dispatch).toHaveBeenCalledWith('toast/notify', expect.anything())
  })

  it('closes dialog when done', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, mocks, store, stubs })

    await wrapper.find(model.confirmModal).vm.$emit('confirmed')
    await flushPromises()
    expect(mocks.$modal.hide).toHaveBeenCalled()
  })

  it('disables button while action is in progress', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    const button = wrapper.find(model.resetToNewButton)

    expect(button.attributes('disabled')).toBeFalsy()

    await wrapper.find(model.confirmModal).vm.$emit('confirmed')
    expect(button.attributes('disabled')).toBeTruthy()

    await flushPromises()
    expect(button.attributes('disabled')).toBeFalsy()
  })

  it('disables dialog while action is in progress', async () => {
    const wrapper = shallowMount(StatusContextMenuItem, { localVue, store, stubs })
    const modal = wrapper.find(model.confirmModal)

    expect(modal.attributes('loading')).toBeFalsy()

    await modal.vm.$emit('confirmed')
    expect(modal.attributes('loading')).toBeTruthy()

    await flushPromises()
    expect(modal.attributes('loading')).toBeFalsy()
  })
})
