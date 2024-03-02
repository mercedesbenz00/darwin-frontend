import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { ConfirmationDialogLayout, Modal } from 'test/unit/stubs'

import CreditsPopup from '@/components/WorkView/CreditsPopup.vue'
import { installCommonComponents } from '@/plugins/components'
import { ErrorCodes } from '@/utils/error/errors'

let localVue: ReturnType<typeof createLocalVue>
let store: ReturnType<typeof createTestStore>
let stubs: Stubs
let mocks: {
  $router: { push: () => void }
  $modal: { show: () => void, hide: () => void }
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(VueJSModal, { dynamic: true })
  installCommonComponents(localVue)

  store = createTestStore()
  stubs = {
    ConfirmationDialogLayout,
    Modal
  }

  mocks = {
    $modal: { show: jest.fn(), hide: jest.fn() },
    $router: { push: jest.fn() }
  }
})

it('matches snapshot', () => {
  const wrapper = shallowMount(CreditsPopup, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('opens modal when error has appropriate code', async () => {
  shallowMount(CreditsPopup, { localVue, mocks, store, stubs })
  await store.commit('workview/SET_ERROR', { code: 'fake code' })
  expect(mocks.$modal.show).not.toHaveBeenCalled()
  await store.commit('workview/SET_ERROR', { code: ErrorCodes.OUT_OF_ANNOTATION_CREDITS })
  expect(mocks.$modal.show).toHaveBeenCalled()
})

it('closes modal on cancel', async () => {
  const wrapper = shallowMount(CreditsPopup, { localVue, mocks, store, stubs })
  await wrapper.find('secondary-button-stub').vm.$emit('click')
  expect(mocks.$modal.hide).toHaveBeenCalled()
})

it('opens plans on confirm', async () => {
  const wrapper = shallowMount(CreditsPopup, { localVue, mocks, store, stubs })
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(mocks.$router.push).toHaveBeenCalledWith('/datasets?settings=plans')
})

it('closes modal on confirm', async () => {
  const wrapper = shallowMount(CreditsPopup, { localVue, mocks, store, stubs })
  jest.spyOn(wrapper.vm.$modal, 'hide')
  await wrapper.find('primary-button-stub').vm.$emit('click')
  expect(wrapper.vm.$modal.hide).toHaveBeenCalled()
})
