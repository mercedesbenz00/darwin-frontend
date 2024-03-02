import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import { installCommonComponents } from '@/plugins/components'
import MainView from '@/views/admin/MainView.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

const stubs: Stubs = {
  'router-link': true,
  'router-view': true
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

it('matches snapshot', () => {
  const wrapper = shallowMount(MainView, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('emit click if you click on sync key button', async () => {
  const wrapper = shallowMount(MainView, { localVue, store, stubs })
  await wrapper.find('secondary-button-stub.sync-keys-button').vm.$emit('click')
  expect(store.dispatch).toHaveBeenCalledWith('admin/syncApiKeys')
})
