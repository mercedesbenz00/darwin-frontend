import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { stubDirectiveWithAttribute } from 'test/unit/directiveStubs'

import HotkeyInput from '@/components/Classes/AnnotationClassDialog/components/HotkeyInput.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('tooltip', stubDirectiveWithAttribute)

let propsData: {
  hotkey?: string | null
  disabled?: boolean
}
let store: ReturnType<typeof createTestStore>

beforeEach(() => { store = createTestStore() })

it('matches snapshot with no hotkey', () => {
  propsData = {}
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot with hotkey', () => {
  propsData = { hotkey: '1' }
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when disabled', () => {
  propsData = { disabled: true }
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot()
})

it('emits update event', async () => {
  propsData = { hotkey: '1' }
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData, store })
  await wrapper.find('.hotkey-input__clicker').trigger('click')
  document.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }))
  await flushPromises()

  expect(wrapper.emitted()['update:hotkey']).toEqual([['2']])
  expect(wrapper.emitted().change).toEqual([['2']])
})

it('shows warning message when key is not one of 1 - 9', async () => {
  propsData = { hotkey: '1' }
  const wrapper = shallowMount(HotkeyInput, { localVue, propsData, store })
  await wrapper.find('.hotkey-input__clicker').trigger('click')
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
  await flushPromises()

  expect(store.dispatch).toBeCalledWith(
    'toast/notify',
    { content: 'Type a number between 1 and 9 to set a class hotkey' }
  )

  expect(wrapper.emitted()['update:hotkey']).toBeUndefined()
  expect(wrapper.emitted().change).toBeUndefined()
})
