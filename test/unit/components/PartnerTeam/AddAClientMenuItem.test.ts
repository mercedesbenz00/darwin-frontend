import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import VModal from 'vue-js-modal'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildTeamPayload } from 'test/unit/factories'
import { ConfirmationDialog } from 'test/unit/stubs'

import AddAClientMenuItem from '@/components/PartnerTeam/AddAClientMenuItem.vue'
import { installCommonComponents } from '@/plugins/components'
import { createClientTeamInvitation } from '@/store/modules/team/actions/createClientTeamInvitation'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(VModal)

installCommonComponents(localVue)

const stubs = { 'confirmation-dialog': ConfirmationDialog }

let store: ReturnType<typeof createTestStore>
let mocks: { $can: jest.Mock }

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  openModal () {
    return this.wrapper.find('sidebar-menu-item-layout-stub').trigger('click')
  }

  get emailField () {
    return this.wrapper.find('input-field-stub')
  }

  get email (): string {
    return this.emailField.props('value')
  }

  setEmail (value: string) {
    this.emailField.vm.$emit('input', value)
  }

  get emailError (): string {
    return this.emailField.props('error')
  }

  setNeuralNetworks (value: boolean) {
    return this.wrapper.find('check-box-stub').vm.$emit('input', value)
  }

  clickSubmit () {
    return this.wrapper.find('primary-button-stub').vm.$emit('click')
  }

  formSubmit () {
    return this.wrapper.find('form').trigger('submit')
  }
}

beforeEach(() => {
  mocks = { $can: jest.fn().mockReturnValue(true) }
  store = createTestStore()
  store.commit('team/SET_CURRENT_TEAM', buildTeamPayload({ managed_status: 'partner' }))
})

it('matches snapshot', () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('renders nothing if current team is not partner', () => {
  mocks.$can = jest.fn().mockReturnValue(false)
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  expect(wrapper.html()).toEqual('')
})

it('opens modal', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  const spy = jest.spyOn(wrapper.vm.$modal, 'show')

  const model = new Model(wrapper)
  await model.openModal()

  expect(spy).toHaveBeenCalledWith('client-invite')
})

it('dispatches action to create invite to store', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  const model = new Model(wrapper)

  await model.setEmail('foo@mail.com')
  await model.setNeuralNetworks(true)
  await model.clickSubmit()
  await flushPromises()

  const expected: StoreActionPayload<typeof createClientTeamInvitation> = {
    email: 'foo@mail.com',
    neuralNetworks: true
  }

  expect(store.dispatch).toHaveBeenCalledWith('team/createClientTeamInvitation', expected)

  await model.setEmail('bar@mail.com')
  await model.setNeuralNetworks(false)
  await model.clickSubmit()

  expected.email = 'bar@mail.com'
  expected.neuralNetworks = false
  expect(store.dispatch).toHaveBeenLastCalledWith('team/createClientTeamInvitation', expected)
})

it('dispatches action on form submit to', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  const model = new Model(wrapper)

  await model.setEmail('foo@mail.com')
  await model.setNeuralNetworks(true)
  await model.formSubmit()

  const expected: StoreActionPayload<typeof createClientTeamInvitation> = {
    email: 'foo@mail.com',
    neuralNetworks: true
  }

  expect(store.dispatch).toHaveBeenCalledWith('team/createClientTeamInvitation', expected)
})

it('closes modal on success', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })

  const spy = jest.spyOn(wrapper.vm.$modal, 'hide')
  spy.mockReset()

  const model = new Model(wrapper)

  await model.clickSubmit()
  await flushPromises()

  expect(spy).toHaveBeenCalledWith('client-invite')
})

it('clears email on success', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  const model = new Model(wrapper)

  await model.setEmail('bar@mail.com')
  expect(model.email).toEqual('bar@mail.com')
  await model.clickSubmit()
  await flushPromises()

  expect(model.email).toEqual('')
})

it('dispatches toast on creation error', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
  const model = new Model(wrapper)

  await model.clickSubmit()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})

it('sets a validation error on the email field', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { isValidationError: true, email: 'Fake error' } })
  const model = new Model(wrapper)

  await model.clickSubmit()
  await flushPromises()

  expect(model.emailError).toEqual('Fake error')
})

it('does not close modal on error success', async () => {
  const wrapper = shallowMount(AddAClientMenuItem, { localVue, mocks, store, stubs })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })

  const spy = jest.spyOn(wrapper.vm.$modal, 'hide')
  spy.mockReset()

  const model = new Model(wrapper)

  await model.clickSubmit()

  expect(spy).not.toHaveBeenCalled()
})
