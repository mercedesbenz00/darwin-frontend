import { createLocalVue, shallowMount, Stubs } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Vuex from 'vuex'

import createTestStore from 'test/unit/createTestStore'
import { buildCustomerPayload, buildBillingInfoPayload } from 'test/unit/factories'

import BillingAddress from '@/components/Plans/BillingAddress.vue'
import { installCommonComponents } from '@/plugins/components'
import { CustomerValidationErrors } from '@/store/modules/billing/types'

const localVue = createLocalVue()
localVue.use(Vuex)
installCommonComponents(localVue)

let store: ReturnType<typeof createTestStore>
const stubs: Stubs = { Select2: true }

const billingInfo = buildBillingInfoPayload({
  address: {
    city: 'Zagreb',
    country: 'HR',
    line_1: '25 A, Some street',
    line_2: '1-C',
    state: 'Fake state',
    postal_code: '10000'
  },
  email: 'accounting@smith.co.com',
  name: 'Smith Co.',
  balance: 0,
  selected_source: null,
  tax_id: 'FAKEVAT123',
  customer: buildCustomerPayload({
  })
})

beforeEach(() => {
  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', billingInfo)
})

it('matches snapshot', () => {
  const wrapper = shallowMount(BillingAddress, { localVue, store, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('updates data on input', async () => {
  store.commit('billing/SET_BILLING_INFO', billingInfo)

  const wrapper = shallowMount(BillingAddress, { localVue, store, stubs })

  wrapper.find('dropdown-stub').vm.$emit('input', 'DE')
  wrapper.find('input-field-stub[name="city"]').vm.$emit('input', 'Varazdin')
  wrapper.find('input-field-stub[name="email"]').vm.$emit('input', 'james@mail.com')
  wrapper.find('input-field-stub[name="line1"]').vm.$emit('input', '23, Some other street')
  wrapper.find('input-field-stub[name="line2"]').vm.$emit('input', '11B')
  wrapper.find('input-field-stub[name="name"]').vm.$emit('input', 'James')
  wrapper.find('input-field-stub[name="postalCode"]').vm.$emit('input', '42000')
  wrapper.find('input-field-stub[name="state"]').vm.$emit('input', 'Other fake state')
  wrapper.find('input-field-stub[name="taxId"]').vm.$emit('input', 'FAKERVAT')
  await flushPromises()

  expect((wrapper.vm as any).getData()).toEqual({
    address: {
      city: 'Varazdin',
      country: 'DE',
      line_1: '23, Some other street',
      line_2: '11B',
      postal_code: '42000',
      state: 'Other fake state'
    },
    email: 'james@mail.com',
    name: 'James',
    tax_id: 'FAKERVAT'
  })
})

it('allows saving billing information to backend', async () => {
  store.commit('billing/SET_BILLING_INFO', billingInfo)

  const wrapper = shallowMount(BillingAddress, { localVue, store, stubs })

  wrapper.find('dropdown-stub').vm.$emit('input', 'DE')
  wrapper.find('input-field-stub[name="city"]').vm.$emit('input', 'Varazdin')
  wrapper.find('input-field-stub[name="email"]').vm.$emit('input', 'james@mail.com')
  wrapper.find('input-field-stub[name="line1"]').vm.$emit('input', '23, Some other street')
  wrapper.find('input-field-stub[name="line2"]').vm.$emit('input', '11B')
  wrapper.find('input-field-stub[name="name"]').vm.$emit('input', 'James')
  wrapper.find('input-field-stub[name="postalCode"]').vm.$emit('input', '42000')
  wrapper.find('input-field-stub[name="state"]').vm.$emit('input', 'Other fake state')
  wrapper.find('input-field-stub[name="taxId"]').vm.$emit('input', 'FAKERVAT')

  await wrapper.find('positive-button-stub').vm.$emit('click')

  expect(store.dispatch).toHaveBeenCalledWith(
    'billing/updateBillingInfo',
    {
      address: {
        city: 'Varazdin',
        country: 'DE',
        line_1: '23, Some other street',
        line_2: '11B',
        postal_code: '42000',
        state: 'Other fake state'
      },
      email: 'james@mail.com',
      name: 'James',
      tax_id: 'FAKERVAT'
    })
})

describe('setError', () => {
  it('sets errors on all fields correctly', async () => {
    const wrapper = shallowMount(BillingAddress, { localVue, store, stubs })

    const component = (wrapper.vm as any)
    const errorPayload: CustomerValidationErrors = {
      city: 'City error',
      country: 'Country error',
      email: 'Email error',
      line1: 'Line 1 error',
      line2: 'Line 2 error',
      name: 'Name error',
      postalCode: 'Postal Code error',
      state: 'State error',
      taxId: 'Tax ID error'
    }

    await component.setErrors(errorPayload)

    expect(wrapper.find('dropdown-stub').props('error')).toEqual('Country error')
    expect(wrapper.find('input-field-stub[name="city"]').props('error')).toEqual('City error')
    expect(wrapper.find('input-field-stub[name="email"]').props('error')).toEqual('Email error')
    expect(wrapper.find('input-field-stub[name="line1"]').props('error')).toEqual('Line 1 error')
    expect(wrapper.find('input-field-stub[name="line2"]').props('error')).toEqual('Line 2 error')
    expect(wrapper.find('input-field-stub[name="name"]').props('error')).toEqual('Name error')
    expect(wrapper.find('input-field-stub[name="postalCode"]').props('error')).toEqual('Postal Code error')
    expect(wrapper.find('input-field-stub[name="state"]').props('error')).toEqual('State error')
    expect(wrapper.find('input-field-stub[name="taxId"]').props('error')).toEqual('Tax ID error')
  })

  it('sets local validation errors correctly', async () => {
    const wrapper = shallowMount(BillingAddress, { localVue, store, stubs })

    const component = (wrapper.vm as any)
    const errorPayload: CustomerValidationErrors = {
      postalCode: 'Postal Code error',
      country: 'Country error'
    }
    await component.setErrors(errorPayload)

    expect(wrapper.find('dropdown-stub').props('error')).toEqual('Country error')
    expect(wrapper.find('input-field-stub[name="postalCode"]').props('error')).toEqual('Postal Code error')
  })
})
