import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import { ConfirmationDialogLayout } from 'test/unit/stubs'
import { buttonEvents, emitRootStub } from 'test/unit/testHelpers'

import CancelPlanConfirmModal from '@/components/Plans/Product/AnnotationCredits/CancelPlanConfirmModal.vue'
import { installCommonComponents } from '@/plugins/components'
import { ProductType } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(VModal)
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const mocks = { $theme: createMockTheme() }
const stubs: Stubs = { ConfirmationDialogLayout }

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('toggles UI', async () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })
  await emitRootStub(wrapper, 'before-open')
  expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
})

it('confirm button is disabled when condition do not matches', async () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })
  expect(wrapper.find('negative-button-stub').attributes('disabled')).toBe('true')

  await wrapper.find('input-field-stub').vm.$emit('input', 'random text')
  expect(wrapper.find('negative-button-stub').attributes('disabled')).toBe('true')
})

it('confirm button is enabled when condition matches', async () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })

  await wrapper.find('input-field-stub').vm.$emit('input', 'cancel my plan')
  expect(wrapper.find('negative-button-stub').attributes('disabled')).toBeUndefined()

  await wrapper.find('negative-button-stub').vm.$emit('click', buttonEvents)
  expect(wrapper.emitted().submit).toHaveLength(1)
})

it('dispatches action to set credit amount to 0 on confirm', async () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })

  await wrapper.find('negative-button-stub').vm.$emit('click', buttonEvents)
  expect(store.dispatch).toBeCalledWith(
    'billing/setSubscriptionAmount',
    { type: ProductType.AnnotationCredits, value: 0 }
  )
})

it('toggles UI on close', async () => {
  const wrapper = shallowMount(CancelPlanConfirmModal, { localVue, mocks, store, stubs })
  await emitRootStub(wrapper, 'closed')
  expect(store.dispatch).toHaveBeenCalledWith('ui/bringFrontSidebar')
})
