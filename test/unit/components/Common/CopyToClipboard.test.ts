import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import CopyToClipboard from '@/components/Common/CopyToClipboard.vue'
import * as clipboard from '@/utils/clipboard'

jest.mock('@/utils/clipboard')

const localVue = createLocalVue()
localVue.use(Vuex)

const propsData = {
  value: 'fake-value'
}

const newStore = () => {
  const store = new Vuex.Store({ modules: {} })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

it('matches snapshot', () => {
  const wrapper = shallowMount(CopyToClipboard, { localVue, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('copies created key to clipboard', () => {
  const store = newStore()
  jest.spyOn(clipboard, 'copy').mockResolvedValue({})
  const wrapper = shallowMount(CopyToClipboard, { localVue, propsData, store })
  wrapper.find('.copy').trigger('click')

  expect(clipboard.copy).toHaveBeenCalledWith('fake-value')
})

it('dispatches toast on copied key', async () => {
  const store = newStore()

  jest.spyOn(clipboard, 'copy').mockResolvedValue({})
  const wrapper = shallowMount(CopyToClipboard, { localVue, propsData, store })
  wrapper.find('.copy').trigger('click')

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/notify', { content: expect.any(String) })
})

it('dispatches toast on failure to copy', async () => {
  const store = newStore()

  jest.spyOn(clipboard, 'copy').mockRejectedValue({})
  const wrapper = shallowMount(CopyToClipboard, { localVue, propsData, store })
  wrapper.find('.copy').trigger('click')

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: expect.any(String) })
})
