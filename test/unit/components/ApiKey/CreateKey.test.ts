import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VueJSModal from 'vue-js-modal'
import Vuex from 'vuex'

import { buildTeamPayload } from 'test/unit/factories'
import { Modal } from 'test/unit/stubs'

import CreateKey from '@/components/ApiKey/CreateKey.vue'
import { installCommonComponents } from '@/plugins/components'
import apiKey, { getInitialState as getInitialApiKeyState } from '@/store/modules/apiKey'

const localVue = createLocalVue()
localVue.use(VueJSModal)
localVue.use(Vuex)
installCommonComponents(localVue)

const newStore = () => {
  const store = new Vuex.Store({
    modules: {
      apiKey: { ...apiKey as any, state: getInitialApiKeyState }
    }
  })
  jest.spyOn(store, 'dispatch').mockResolvedValue({})
  return store
}

const stubs: Stubs = {
  'input-field': true,
  Modal
}

const team = buildTeamPayload({ id: 1, name: 'v7' })

it('matches snapshot', () => {
  const propsData = { team }
  const wrapper = shallowMount(CreateKey, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('validates key name', async () => {
  const store = newStore()

  const setError = jest.fn()

  const InputField = localVue.extend({
    name: 'input-field-stub',
    template: '<div />',
    methods: { setError }
  })

  const propsData = { team }
  const stubsWithInput = { InputField }

  const wrapper = shallowMount(
    CreateKey,
    { localVue, propsData, store, stubs: stubsWithInput }
  )

  await wrapper.find('positive-button-stub').vm.$emit('click')

  expect(store.dispatch).not.toHaveBeenCalled()
  expect(setError).toHaveBeenCalledWith('You must type in a name.')
})

it('sets permissions on permission group emit', async () => {
  const store = newStore()
  const propsData = { team }
  const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })
  const component = wrapper.vm as any

  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team', ['view_team', 'update_team'])
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team_members', ['view_team_members'])
  await wrapper.vm.$nextTick()
  expect(component.permissions).toEqual([['view_team', 'all'], ['update_team', 'all'], ['view_team_members', 'all']])

  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team_members', [])
  await wrapper.vm.$nextTick()
  expect(component.permissions).toEqual([['view_team', 'all'], ['update_team', 'all']])
})

it('dispatches action to create key', async () => {
  const store = newStore()
  const propsData = { team }
  const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })

  wrapper.find('input-field-stub').vm.$emit('change', 'test key')
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team', ['view_team', 'update_team'])
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team_members', ['view_team_members'])

  await wrapper.find('positive-button-stub').vm.$emit('click')

  expect(store.dispatch).toHaveBeenCalledWith('apiKey/create', {
    name: 'test key',
    permissions: [['view_team', 'all'], ['update_team', 'all'], ['view_team_members', 'all']],
    team
  })
})

it('dispatches action to create key on input enter', async () => {
  const store = newStore()
  const propsData = { team }
  const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })

  wrapper.find('input-field-stub').vm.$emit('change', 'test key')
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team', ['view_team', 'update_team'])
  wrapper.find('input-field-stub').vm.$emit('enter')
  await wrapper.vm.$nextTick()

  expect(store.dispatch).toHaveBeenCalledWith('apiKey/create', {
    name: 'test key',
    permissions: [['view_team', 'all'], ['update_team', 'all']],
    team
  })
})

it('shows toast on create failure', async () => {
  const store = newStore()

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ error: { message: 'test error' } })

  const propsData = { team }
  const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })

  wrapper.find('input-field-stub').vm.$emit('change', 'test key')
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team', ['view_team', 'update_team'])
  await wrapper.find('positive-button-stub').vm.$emit('click')

  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'test error' })
})

it('sets key on creation', async () => {
  const store = newStore()
  const propsData = { team }

  const dispatch = store.dispatch as jest.Mock
  dispatch.mockResolvedValue({ data: { prefix: 'foo', value: 'bar' } })

  const wrapper = shallowMount(CreateKey, { localVue, propsData, store, stubs })

  wrapper.find('input-field-stub').vm.$emit('change', 'test key')
  wrapper.find('permission-group-selector-stub').vm.$emit('change', 'manage_team', ['view_team', 'update_team'])
  await wrapper.find('positive-button-stub').vm.$emit('click')

  await flushPromises()

  expect(wrapper.html()).toContain('foo.bar')
})

it('matches snapshot when key created', () => {
  const store = newStore()
  const propsData = { team }
  const data = () => ({ key: 'fake-created-key.random' })
  const wrapper = shallowMount(CreateKey, { data, localVue, propsData, store, stubs })
  expect(wrapper).toMatchSnapshot()
})
