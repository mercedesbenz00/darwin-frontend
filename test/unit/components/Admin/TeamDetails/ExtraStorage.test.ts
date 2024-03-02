import { shallowMount, createLocalVue, Wrapper } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCustomerSubscriptionPayload } from 'test/unit/factories'
import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'

import ExtraStorage from '@/components/Admin/TeamDetails/ExtraStorage.vue'
import { installCommonComponents } from '@/plugins/components'

const localVue = createLocalVue()
installCommonComponents(localVue)
localVue.use(Vuex)

const v7 = buildAdminTeamPayload({
  name: 'V7',
  customer_v3: {
    customer_subscription: buildCustomerSubscriptionPayload({
      storage_extra: 10
    })
  }
})

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
})

class Model {
  wrapper: Wrapper<Vue>

  constructor (wrapper: Wrapper<Vue>) {
    this.wrapper = wrapper
  }

  get editButton () {
    return this.wrapper.find('secondary-button-stub')
  }

  startEditing () {
    return this.editButton.vm.$emit('click')
  }

  get newValueField () {
    return this.wrapper.find('input-field-stub')
  }

  setValue (value: number) {
    return this.newValueField.vm.$emit('input', value)
  }

  get saveButton () {
    return this.wrapper.find('positive-button-stub')
  }

  saveChanges () {
    return this.saveButton.vm.$emit('click')
  }
}

it('matches snapshot', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(ExtraStorage, { localVue, propsData, store })
  expect(wrapper).toMatchSnapshot('normal')

  const model = new Model(wrapper)
  await model.startEditing()
  expect(wrapper).toMatchSnapshot('editing')
})

it('renders storage_extra', () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(ExtraStorage, { localVue, propsData, store })
  expect(wrapper.text()).toContain('10')
})

it('supports updating storage_extra', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(ExtraStorage, { localVue, propsData, store })
  const model = new Model(wrapper)

  await model.startEditing()
  await model.setValue(10)
  await model.saveChanges()

  expect(store.dispatch).toHaveBeenCalledWith('admin/updateCustomerSubscription', {
    team: v7,
    storage_extra: 10
  })

  await flushPromises()

  expect(model.newValueField.exists()).toBe(false)
})

it('renders validation errors on update fail', async () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(ExtraStorage, { localVue, propsData, store })
  const model = new Model(wrapper)
  await model.startEditing()
  await model.setValue(28)

  const error = {
    isValidationError: true,
    storage_extra: 'Is required'
  }
  jest.spyOn(store, 'dispatch').mockResolvedValue({ error })
  await model.saveChanges()

  await flushPromises()

  expect(model.newValueField.exists()).toBe(true)
  expect(model.newValueField.props('error')).toEqual(error.storage_extra)
})
