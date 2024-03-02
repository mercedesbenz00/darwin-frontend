import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'
import { VPopover } from 'test/unit/stubs'

import AnnotationControl from '@/components/WorkView/LayerBar/AnnotationControl/AnnotationControl.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let store: ReturnType<typeof createTestStore>

const mocks = { $modal: { hide: jest.fn() } }
const stubs = { VPopover }
let propsData: { readonly?: boolean }

beforeEach(() => {
  store = createTestStore()
  propsData = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AnnotationControl, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when readonly', () => {
  propsData.readonly = true
  const wrapper = shallowMount(AnnotationControl, { localVue, mocks, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('dispatches workview/deleteAllVisibleStageAnnotations when delete is confirmed', async () => {
  const wrapper = shallowMount(AnnotationControl, { localVue, mocks, propsData, store, stubs })
  await wrapper.find('delete-confirmation-dialog-stub').vm.$emit('confirmed')
  expect(store.dispatch).toBeCalledWith('workview/deleteAllVisibleStageAnnotations')
})
