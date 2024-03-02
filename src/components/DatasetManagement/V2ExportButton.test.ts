import { createLocalVue, shallowMount } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'

import V2ExportButton from './V2ExportButton.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

let propsData: {
  buttonType?: 'primary-button' | 'secondary-light-button'
}

beforeEach(() => {
  store = createTestStore()
  propsData = {}
})

it('matches snapshot', () => {
  const wrapper = shallowMount(V2ExportButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when primary button', () => {
  propsData.buttonType = 'primary-button'
  const wrapper = shallowMount(V2ExportButton, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('opens the dialog when the button is pressed', () => {
  const wrapper = shallowMount(V2ExportButton, { localVue, propsData, store })
  const dialog = wrapper.vm.$refs.exportDialog as any
  dialog.show = jest.fn()
  wrapper.find('darwinbutton-stub').vm.$emit('click')
  expect(dialog.show).toHaveBeenCalled()
  expect(store.dispatch).toHaveBeenCalledWith('ui/putBackSidebar')
})
