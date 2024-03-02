import { InvoicePayload } from '@/store/modules/billing/types'

type InvoicePayloadBuildParams = Partial<InvoicePayload>

export const buildInvoicePayload = (params: InvoicePayloadBuildParams): InvoicePayload => ({
  amount_due: 500,
  created: 12345678,
  currency: 'USD',
  due_date: null,
  id: 'inv_123',
  invoice_pdf: 'foo.pdf',
  period_end: null,
  period_start: null,
  receipt_url: null,
  status: 'paid',
  subtotal: 500,
  ...params
})
