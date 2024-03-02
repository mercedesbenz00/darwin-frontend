import { shallowMount, createLocalVue } from '@vue/test-utils'
import moment from 'moment'

import { buildAdminTeamPayload } from 'test/unit/factories/buildAdminTeamPayload'
import { VPopover } from 'test/unit/stubs'

import Invoice from '@/components/Admin/TeamList/Invoice.vue'

const unix = (iso: string) => moment(iso).unix()
const localVue = createLocalVue()

const v7 = buildAdminTeamPayload({ name: 'V7' })

const v7WithDraft = buildAdminTeamPayload({
  name: 'V7',
  last_invoice_amount: 1000,
  last_invoice_created: unix('2000-01-01T00:00:00.000Z'),
  last_invoice_due_date: null,
  last_invoice_pdf: null,
  last_invoice_status: 'draft'
})

const v7WithOpen = buildAdminTeamPayload({
  name: 'V7',
  last_invoice_amount: 1000,
  last_invoice_created: unix('2000-01-01T00:00:00.000Z'),
  last_invoice_due_date: unix('2040-01-01T00:00:00.000Z'),
  last_invoice_pdf: 'https://fake.stripe.com/inv1234.pdf',
  last_invoice_status: 'open'
})

const v7WithPaid = buildAdminTeamPayload({
  name: 'V7',
  last_invoice_amount: 1000,
  last_invoice_created: unix('2000-01-01T00:00:00.000Z'),
  last_invoice_due_date: unix('2019-12-31T02:00:00.000Z'),
  last_invoice_pdf: 'https://fake.stripe.com/inv1234.pdf',
  last_invoice_status: 'paid'
})

const v7WithUncollectible = buildAdminTeamPayload({
  name: 'V7',
  last_invoice_amount: 1000,
  last_invoice_created: unix('2000-01-01T00:00:00.000Z'),
  last_invoice_due_date: unix('2019-12-31T02:00:00.000Z'),
  last_invoice_pdf: 'https://fake.stripe.com/inv1234.pdf',
  last_invoice_status: 'uncollectible'
})

const v7WithVoid = buildAdminTeamPayload({
  name: 'V7',
  last_invoice_amount: 1000,
  last_invoice_created: unix('2000-01-01T00:00:00.000Z'),
  last_invoice_due_date: unix('2019-12-31T02:00:00.000Z'),
  last_invoice_pdf: 'https://fake.stripe.com/inv1234.pdf',
  last_invoice_status: 'uncollectible'
})

const stubs = { VPopover }

it('matches snapshot with no invoice', () => {
  const propsData = { team: v7 }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when draft invoice', () => {
  const propsData = { team: v7WithDraft }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when open invoice', () => {
  const propsData = { team: v7WithOpen }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when paid invoice', () => {
  const propsData = { team: v7WithPaid }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when uncollectible invoice', () => {
  const propsData = { team: v7WithUncollectible }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})

it('matches snapshot when void invoice', () => {
  const propsData = { team: v7WithVoid }
  const wrapper = shallowMount(Invoice, { localVue, propsData, stubs })
  expect(wrapper).toMatchSnapshot()
})
