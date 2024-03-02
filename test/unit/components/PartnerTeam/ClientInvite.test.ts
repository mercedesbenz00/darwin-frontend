import { createLocalVue, shallowMount, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'

import ClientInvite from '@/components/PartnerTeam/ClientInvite.vue'
import { installCommonComponents } from '@/plugins/components'
import { createClientTeamInvitation } from '@/store/modules/team/actions/createClientTeamInvitation'
import { StoreActionPayload } from '@/store/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>

it('matches snapshot', () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
  expect(wrapper).toMatchSnapshot()
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get emailField (): Wrapper<Vue> {
    return this.wrapper.find('input-field-stub')
  }

  get email (): string {
    return this.emailField.props('value')
  }

  setEmail (value: string): void {
    this.emailField.vm.$emit('input', value)
  }

  get emailError (): string {
    return this.emailField.props('error')
  }

  setNeuralNetworks (value: boolean): Vue {
    return this.wrapper.find('check-box-stub').vm.$emit('input', value)
  }

  formSubmit (): void | Promise<void> {
    return this.wrapper.find('form').trigger('submit')
  }
}

beforeEach(() => {
  store = createTestStore()
})

it('dispatches action to create invite to store', async () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
  const model = new Model(wrapper)

  await model.setEmail('foo@mail.com')
  await model.setNeuralNetworks(true)
  await model.formSubmit()
  await flushPromises()

  const expected: StoreActionPayload<typeof createClientTeamInvitation> = {
    email: 'foo@mail.com',
    neuralNetworks: true
  }

  expect(store.dispatch).toHaveBeenCalledWith('team/createClientTeamInvitation', expected)

  await model.setEmail('bar@mail.com')
  await model.setNeuralNetworks(false)
  await model.formSubmit()

  expected.email = 'bar@mail.com'
  expected.neuralNetworks = false
  expect(store.dispatch).toHaveBeenLastCalledWith('team/createClientTeamInvitation', expected)
})

it('dispatches action on form submit to', async () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
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

it('clears email on success', async () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
  const model = new Model(wrapper)

  await model.setEmail('bar@mail.com')
  expect(model.email).toEqual('bar@mail.com')
  await model.formSubmit()
  await flushPromises()

  expect(model.email).toEqual('')
})

it('dispatches toast on creation error', async () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error: { message: 'Fake error' } })
  const model = new Model(wrapper)

  await model.formSubmit()
  await flushPromises()

  expect(store.dispatch).toHaveBeenCalledWith('toast/warning', { content: 'Fake error' })
})

it('sets a validation error on the email field', async () => {
  const wrapper = shallowMount(ClientInvite, { localVue, store })
  jest.spyOn(store, 'dispatch')
    .mockResolvedValue({ error: { isValidationError: true, email: 'Fake error' } })
  const model = new Model(wrapper)

  await model.formSubmit()
  await flushPromises()

  expect(model.emailError).toEqual('Fake error')
})
