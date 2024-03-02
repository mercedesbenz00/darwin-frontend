import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import { cloneDeep } from 'lodash'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import { buildApiKeyPayload } from 'test/unit/factories'

import DeleteKeyButton from '@/components/ApiKey/DeleteKeyButton.vue'
import { installCommonComponents } from '@/plugins/components'
import apiKey from '@/store/modules/apiKey'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)
installCommonComponents(localVue)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      apiKey: { ...apiKey as any, state: cloneDeep(apiKey.state) }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const key = buildApiKeyPayload({
  id: 1,
  prefix: 'abcd',
  name: 'Key 1',
  team_id: 1,
  permissions: [['run_inference', 'model:49bff194-465e-4fff-9077-8f6e6666db3a']]
})

const buttonEventMock = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn()
}

it('matches snapshot', () => {
  const store = newStore()
  const propsData = { apiKey: key }
  const wrapper = shallowMount(DeleteKeyButton, { localVue, store, propsData })
  expect(wrapper).toMatchSnapshot()
})

it('shows and hides modal on revoke-cancel', async () => {
  const store = newStore()
  const propsData = { apiKey: key }
  const mocks = { $modal: { show: jest.fn(), hide: jest.fn() } }
  const wrapper = shallowMount(DeleteKeyButton, { localVue, mocks, store, propsData })

  await wrapper.find('negative-button-stub').vm.$emit('click', buttonEventMock)
  expect(mocks.$modal.show).toHaveBeenCalled()

  await wrapper.find('.modal__footer-left').vm.$emit('click', buttonEventMock)
  expect(mocks.$modal.hide).toHaveBeenCalled()
})

it('dispatches store action on confirmed revoke', async () => {
  const store = newStore()
  const propsData = { apiKey: key }
  const wrapper = shallowMount(DeleteKeyButton, { localVue, store, propsData })

  await wrapper.find('.modal__footer-right').vm.$emit('click', buttonEventMock)
  expect(store.dispatch).toHaveBeenCalledWith('apiKey/deleteKey', key)
})

it('dispatches toast if revoke fails', async () => {
  const store = newStore()
  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ error: { message: 'Test error' } })

  const propsData = { apiKey: key }
  const wrapper = shallowMount(DeleteKeyButton, { localVue, store, propsData })

  await wrapper.find('.modal__footer-right').vm.$emit('click', buttonEventMock)
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Test error' })
})
