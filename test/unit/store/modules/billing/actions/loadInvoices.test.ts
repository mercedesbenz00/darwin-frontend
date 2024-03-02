import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { createUnstubbedTestStore } from 'test/unit/createTestStore'
import { buildAxiosResponse, buildInvoicePayload, buildTeamPayload } from 'test/unit/factories'

import * as backend from '@/utils/backend'

jest.mock('@/utils/backend', () => ({ loadInvoices: jest.fn() }))

const localVue = createLocalVue()
localVue.use(Vuex)
let store: ReturnType<typeof createUnstubbedTestStore>

const v7 = buildTeamPayload({ slug: 'v7' })

const invoices = [buildInvoicePayload({})]

beforeEach(() => {
  store = createUnstubbedTestStore()
  jest.spyOn(backend, 'loadInvoices')
    .mockResolvedValue(buildAxiosResponse({ data: invoices }))
  store.commit('team/SET_CURRENT_TEAM', v7)
})

it('throws if no current team', async () => {
  store.commit('team/RESET_ALL')
  await expect(store.dispatch('billing/loadInvoices')).rejects.toThrow()
})

it('sends request to backend', async () => {
  await store.dispatch('billing/loadInvoices')
  expect(backend.loadInvoices).toHaveBeenCalledWith(v7.id)
})

it('returns response', async () => {
  const response = await store.dispatch('billing/loadInvoices', v7.id)
  expect(response.data).toEqual(invoices)
})

it('updates credit usage in store', async () => {
  expect(store.state.billing.invoices).toEqual([])
  await store.dispatch('billing/loadInvoices', v7.id)
  expect(store.state.billing.invoices).toEqual(invoices)
})

it('returns backend error', async () => {
  jest.spyOn(backend, 'loadInvoices').mockResolvedValue({ error: { message: 'foo', isValidationError: false } })
  expect(await store.dispatch('billing/loadInvoices', v7.id))
    .toEqual({ error: { message: 'foo', isValidationError: false } })
  expect(store.state.billing.invoices).toEqual([])
})
