import { createLocalVue, shallowMount, mount } from '@vue/test-utils'
import Vuex from 'vuex'

import { createMockTheme } from 'test/unit/components/mocks'
import createTestStore from 'test/unit/createTestStore'
import {
  buildBillingInfoPayload,
  buildInvoicePayload
} from 'test/unit/factories'

import Invoices from '@/components/Plans/Invoices.vue'
import loadingDirective from '@/directives/loading'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive('loading', loadingDirective)

const billingInfo = buildBillingInfoPayload({})

const mocks = {
  $theme: createMockTheme()
}

let store: ReturnType<typeof createTestStore>

beforeEach(() => {
  store = createTestStore()
  store.commit('billing/SET_BILLING_INFO', billingInfo)
})

it('matches snapshot', () => {
  store.commit('billing/SET_INVOICES', [
    buildInvoicePayload({ id: 'inv_1', receipt_url: null }),
    buildInvoicePayload({ id: 'inv_2', receipt_url: 'foo' })
  ])
  const wrapper = mount(Invoices, { localVue, store, mocks })
  expect(wrapper).toMatchSnapshot()
})

it('renders invoices with receipt only', () => {
  store.commit('billing/SET_INVOICES', [
    buildInvoicePayload({ id: 'inv_1', receipt_url: null }),
    buildInvoicePayload({ id: 'inv_2', receipt_url: 'foo' })
  ])

  const wrapper = mount(Invoices, { localVue, store, mocks })
  expect(wrapper.findAll('tbody tr').length).toEqual(1)
})

it('renders message if no visible invoices', () => {
  store.commit('billing/SET_BILLING_INFO', billingInfo)
  store.commit('billing/SET_INVOICES', [])

  const wrapper = shallowMount(Invoices, { localVue, store, mocks })
  expect(wrapper.text()).toContain('No payments')
})

describe('date', () => {
  const may25th2025Unix = Math.floor(new Date(2025, 4, 25).getTime() / 1000)
  const january17th2026Unix = Math.floor(new Date(2026, 0, 17).getTime() / 1000)

  it('renders dueDate if available', () => {
    const invoice =
      buildInvoicePayload({ receipt_url: 'foo', due_date: may25th2025Unix, created: january17th2026Unix })

    store.commit('billing/SET_INVOICES', [invoice])
    const wrapper = mount(Invoices, { localVue, store, mocks })
    expect(wrapper.text()).toContain('May 25th, 2025')
  })

  it('renders created date if dueDate not available', () => {
    const invoice =
      buildInvoicePayload({ receipt_url: 'foo', created: january17th2026Unix })

    store.commit('billing/SET_INVOICES', [invoice])
    const wrapper = mount(Invoices, { localVue, store, mocks })
    expect(wrapper.text()).toContain('January 17th, 2026')
  })
})

describe('amount', () => {
  it('renders formatted subtotal', () => {
    const invoice = buildInvoicePayload({ receipt_url: 'foo', amount_due: 750, subtotal: 650 })
    store.commit('billing/SET_INVOICES', [invoice])

    const wrapper = mount(Invoices, { localVue, store, mocks })
    expect(wrapper.text()).toContain('$7.50')
  })
})

describe('status', () => {
  it('renders formatted status', () => {
    const invoice = buildInvoicePayload({ receipt_url: 'foo', status: 'paid' })
    store.commit('billing/SET_INVOICES', [invoice])

    const wrapper = mount(Invoices, { localVue, store, mocks })
    expect(wrapper.text()).toContain('Paid')
  })
})
