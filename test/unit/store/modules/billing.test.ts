import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import {
  buildAxiosResponse,
  buildBillingInfoPayload,
  buildCustomerPayload,
  buildInvoicePayload,
  buildParsedError,
  buildTeamPayload,
  buildUsageReportPayload
} from 'test/unit/factories'

import { BillingInfoPayload, CardStatus } from '@/store/modules/billing/types'
import * as backend from '@/utils/backend'

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ id: 7 })

beforeEach(() => {
  store = createUnstubbedTestStore()
  store.commit('team/SET_CURRENT_TEAM', v7)
})

describe('billing/updateBillingInfo', () => {
  let spy: jest.SpyInstance

  beforeEach(() => {
    spy = jest.spyOn(backend, 'updateBillingInfo')
      .mockResolvedValue(buildAxiosResponse({ data: 'foo' }))
  })

  afterEach(() => {
    spy.mockReset()
  })

  it('throws if no current team', async () => {
    store.commit('team/RESET_ALL')
    await expect(store.dispatch('billing/updateBillingInfo')).rejects.toThrow()
  })

  it('sends request to backend', async () => {
    await store.dispatch('billing/updateBillingInfo', { email: 'foo', name: 'bar' })
    expect(backend.updateBillingInfo).toHaveBeenCalledWith({ teamId: 7, email: 'foo', name: 'bar' })

    await store.dispatch('billing/updateBillingInfo', { address: { line1: 'foo' } })
    expect(backend.updateBillingInfo).toHaveBeenCalledWith({ teamId: 7, address: { line1: 'foo' } })

    await store.dispatch('billing/updateBillingInfo', { token: 'foo' })
    expect(backend.updateBillingInfo).toHaveBeenCalledWith({ teamId: 7, token: 'foo' })

    await store.dispatch('billing/updateBillingInfo', { taxId: 'foo' })
    expect(backend.updateBillingInfo).toHaveBeenCalledWith({ teamId: 7, taxId: 'foo' })
  })

  it('returns response', async () => {
    const response = await store.dispatch('billing/updateBillingInfo', {})
    expect(response.data).toEqual('foo')
  })

  it('updates billing info in store', async () => {
    expect(store.state.billing.billingInfo).toBeNull()
    await store.dispatch('billing/updateBillingInfo', {})
    expect(store.state.billing.billingInfo).toEqual('foo')
  })

  it('returns backend error', async () => {
    jest.spyOn(backend, 'updateBillingInfo')
      .mockResolvedValue(buildParsedError({ message: 'foo' }))
    expect(await store.dispatch('billing/updateBillingInfo', {}))
      .toEqual({ error: expect.objectContaining({ message: 'foo' }) })
    expect(store.state.billing.billingInfo).toBeNull()
  })
})

describe('billing/SET_BILLING_INFO', () => {
  const billingInfoPayload = buildBillingInfoPayload({
    address: null,
    balance: 0,
    customer: buildCustomerPayload(),
    email: 'foo@example.com',
    name: 'Foo',
    selected_source: null,
    tax_id: null
  })

  it('sets billingInfo', () => {
    expect(store.state.billing.billingInfo).toBeNull()
    store.commit('billing/SET_BILLING_INFO', billingInfoPayload)
    expect(store.state.billing.billingInfo).toEqual(billingInfoPayload)
  })
})

describe('billing/SET_SELECTED_SOURCE', () => {
  const billingInfoPayload = buildBillingInfoPayload({
    selected_source: {
      id: 'src_321',
      last4: '4321',
      brand: 'MasterCard',
      category: 'source',
      type: 'credit-card'
    }
  })

  const newSourcePayload: BillingInfoPayload['selected_source'] = {
    id: 'src_123',
    last4: '1234',
    brand: 'VISA',
    category: 'source',
    type: 'credit-card'
  }

  it('sets selected source on existing billing info', () => {
    store.commit('billing/SET_BILLING_INFO', billingInfoPayload)
    expect(store.state.billing.billingInfo!.selected_source)
      .toEqual(billingInfoPayload.selected_source)

    store.commit('billing/SET_SELECTED_SOURCE', { selected_source: newSourcePayload })
    expect(store.state.billing.billingInfo!.selected_source).toEqual(newSourcePayload)
  })

  it('does nothing if no billing info in state', () => {
    expect(store.state.billing.billingInfo).toBeNull()
    store.commit('billing/SET_SELECTED_SOURCE', { selected_source: newSourcePayload })
    expect(store.state.billing.billingInfo).toBeNull()
  })

  it('does nothing if no source in payload', () => {
    store.commit('billing/SET_BILLING_INFO', billingInfoPayload)
    store.commit('billing/SET_SELECTED_SOURCE', { selected_source: null })
    expect(store.state.billing.billingInfo!.selected_source)
      .toEqual(billingInfoPayload.selected_source)
  })
})

describe('billing/SET_COUNTRIES', () => {
  it('sets countries', () => {
    const croatia = { name: 'Croatia', alpha2: 'HR' }
    expect(store.state.billing.countries).toEqual([])
    store.commit('billing/SET_COUNTRIES', [croatia])
    expect(store.state.billing.countries).toEqual([croatia])
  })
})

describe('billing/SET_INVOICES', () => {
  const invoicePayload = buildInvoicePayload({
    id: 'i123',
    amount_due: 500,
    currency: 'EUR',
    due_date: 12345678,
    invoice_pdf: 'foo.pdf',
    status: 'paid'
  })

  it('sets invoices', () => {
    expect(store.state.billing.invoices).toEqual([])
    store.commit('billing/SET_INVOICES', [invoicePayload])
    expect(store.state.billing.invoices).toEqual([invoicePayload])
  })
})

describe('billing/SET_USAGE_REPORT', () => {
  const usageReportPayload = buildUsageReportPayload()

  it('sets usage', () => {
    expect(store.state.billing.usageReport).toBeNull()
    store.commit('billing/SET_USAGE_REPORT', usageReportPayload)
    expect(store.state.billing.usageReport).toEqual(usageReportPayload)
  })
})

describe('billing/SET_CREDITS', () => {
  const credits = 151200

  it('sets credits', () => {
    expect(store.state.billing.credits).toEqual(0)
    store.commit('billing/SET_CREDITS', credits)
    expect(store.state.billing.credits).toEqual(151200)
  })
})

describe('billing/SET_CARD_STATUS', () => {
  const errorStatus: CardStatus = { error: 'Message', complete: false }
  it('sets and unsets cardStatus', () => {
    expect(store.state.billing.cardStatus).toBeNull()

    store.commit('billing/SET_CARD_STATUS', errorStatus)
    expect(store.state.billing.cardStatus).toEqual(errorStatus)

    store.commit('billing/SET_CARD_STATUS', null)
    expect(store.state.billing.cardStatus).toBeNull()
  })
})
